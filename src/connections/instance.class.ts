import * as vscode from 'vscode'
import INode from "../tree/inode.interface"
import { Driver, Transaction } from 'neo4j-driver'
import Database from './database.class'
import User from './user.class'
import Label from './label.class'
import Role from './role.class'
import { getDriverForConnection, iconPath } from '../utils'
import { Connection, Scheme } from '../constants'

export default class Instance implements INode {

  private driver?: Driver
  private error?: Error

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly scheme: Scheme,
    public readonly host: string,
    public readonly port: string,
    public readonly username: string,
    public readonly password: string,
    public readonly active: boolean
  ) {
    // this.getDriver()
    //   .then(driver => driver.verifyConnectivity())
    //   .catch(e => this.error = e)
  }

  async getTreeItem(): Promise<vscode.TreeItem> {
    const driver = await this.getDriver()
    const session = driver.session()

    let icon = 'database'
    let edition = ''

    if (this.host.endsWith('.neo4j.io')) {
      icon = 'database-aura'

      edition = ` (aura)`
    }
    else if (this.error) {
      icon = 'alert'
    }
    else {
      try {
        const res = await session.executeRead(
          tx => tx.run('CALL dbms.components')
        )

        edition = ` (${res.records[0].get('edition')})`
        const versions = res.records[0].get('versions')

        if (versions[0].includes('aura')) {
          icon = 'database-aura'
        }
      }
      catch (e: any) {
        this.error = e
      }

      await session.close()
    }

    const active = this.active ? '*' : ''

    return {
      id: this.id,
      label: `${this.name || this.id}${edition}${active}`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "connection",
      iconPath: iconPath(icon),
      command: {
        title: 'Set as Active Connection',
        command: 'neo4j.setActiveConnection',
        tooltip: `Set ${this.id} as the Active Connection`,
        arguments: [ this ],
      }
    }
  }

  async getDriver(): Promise<Driver> {
    if ( !this.driver ) {
      this.driver = getDriverForConnection(this satisfies Connection)
    }

    return this.driver
  }

  async getChildren(): Promise<INode[]> {
    if ( this.error ) {
      return [ new Label(
        this.error.message,
        'error',
        'alert'
      ) ]
    }

    return []

    // const session = driver.session({ database: "system" });
    // const tx = session.beginTransaction();

    // return Promise.all([
    //     this.getDatabases(tx),
    //     this.getUsers(tx),
    //     this.getRoles(tx),
    // ])
    //     .then(([ databases, users, roles ]) => databases.concat(users, roles))
    //     .catch(e => {
    //         this.error = e;
    //         return [];
    //     });
  }

  getDatabases(tx: Transaction): Promise<INode[]> {
    return tx.run('SHOW DATABASES')
      .then(res => {
        return res.records.map(row => new Database(
          row.get('name'),
          row.get('address'),
          row.get('role'),
          row.get('requestedStatus'),
          row.get('currentStatus'),
          row.get('error'),
          row.get('default')
        ))
      })
      .catch(e => {
        this.error = e
        return []
      })

  }

  getUsers(tx: Transaction): Promise<INode> {
    return tx.run('SHOW USERS')
      .then(res => {
        const children = res.records.map(row => new User(
          row.get('user'),
          row.get('roles'),
          row.get('passwordChangeRequired'),
          row.get('suspended')
        ))

        return new Label(
          'Users',
          'users',
          'users',
          children
        )
      })

  }

  getRoles(tx: Transaction): Promise<INode> {
    return tx.run('SHOW ALL ROLES WITH USERS')
      .then(res => {
        const reduced = res.records.map(row => ({
          role: row.get('role'),
          member: row.get('member')
        })).reduce((acc: Record<string, Role>, row: Record<string, any>) => {
          if (!acc[row.role]) {
            acc[row.role] = new Role(row.role)
          }

          if (row.member) {
            acc[row.role].addMember(row.member)
          }

          return acc
        }, {})

        const children = Object.values(reduced)

        return new Label(
          'Roles',
          'roles',
          'roles',
          children
        )
      })
  }
}

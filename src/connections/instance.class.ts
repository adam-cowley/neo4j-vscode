import * as path from 'path'
import * as vscode from 'vscode'
import INode from "../tree/inode.interface"
import neo4j, { Driver, Transaction } from 'neo4j-driver'
import Database from './database.class'
import User from './user.class'
import Label from './label.class'
import Role from './role.class'

export default class Instance implements INode {

  private driver?: Driver
  private error?: Error

  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly scheme: string,
    private readonly host: string,
    private readonly port: string,
    private readonly username: string,
    private readonly password: string,
    private readonly active: boolean
  ) { }

  async getTreeItem(): Promise<vscode.TreeItem> {
    const driver = await this.getDriver()
    const session = driver.session()

    let icon = 'database.svg'
    let edition = ''

    if (this.host.endsWith('.neo4j.io')) {
      icon = 'database-aura.svg'
    }
    else if (this.error) {
      icon = 'alert.svg'
    }
    else {
      try {
        const res = await session.executeRead(
          tx => tx.run('CALL dbms.components')
        )

        edition = ` (${res.records[0].get('edition')})`
        const versions = res.records[0].get('versions')

        if (versions[0].includes('aura')) {
          icon = 'database-aura.svg'
        }
      }
      catch (e) {
        console.error(e)
      }

      await session.close()
    }

    const active = this.active ? '*' : ''

    return {
      id: this.id,
      label: `${this.name || this.id}${edition}${active}`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "connection",
      iconPath: path.join(__filename, '..', '..', '..', 'images', 'icons', icon)
    }
  }

  async getChildren(): Promise<INode[]> {
    return []
    // const driver = await this.getDriver();

    // if ( this.error ) {
    //     return Promise.resolve([ new Label(this.error.message, 'error', path.join(__filename, '..', '..', '..', 'images', 'icons', 'alert.svg')) ]);
    // }

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

  async getDriver(): Promise<Driver> {
    const driver = neo4j.driver(`${this.scheme}://${this.host}:${this.port}`, neo4j.auth.basic(this.username, this.password))
    await driver.verifyConnectivity()
      .catch(e => this.error = e)

    return driver
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

        return new Label('Users', 'users', path.join(__filename, '..', '..', '..', 'images', 'icons', 'users.svg'), children)
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

        return new Label('Roles', 'roles', path.join(__filename, '..', '..', '..', 'images', 'icons', 'roles.svg'), children)
      })
  }
}

const isDevelopment = process.env.NODE_ENV === 'development';
const dbPath = isDevelopment ? 'database.db' : 'resources/assets/database.db';
const Database = require('better-sqlite3')(dbPath);
const ExcelJS = require('exceljs');
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const getSQLDatetime = require('../utils/getSQLDatetime');

process.on('exit', () => Database.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
  dataBase: {
    getAll(table, columns = '*') {
      return Database.prepare(`SELECT ${columns} FROM ${table}`).all();
    },
    addInventory(inv) {
      return Database.prepare(
        `INSERT INTO inventory (title, b_code, k_code, is_cons, create_date, update_date, balance) VALUES (@title, @b_code, @k_code, @is_cons, @create_date, @update_date,@balance)`
      ).run({
        title: inv.title,
        b_code: inv.bCode,
        k_code: inv.kCode,
        is_cons: inv.isCons,
        create_date: getSQLDatetime(),
        update_date: getSQLDatetime(),
        balance: inv.balance,
      });
    },
    updateInventoryBalance(id, newBalance) {
      return Database.prepare(
        `UPDATE inventory SET balance = @balance, update_date = @update_date WHERE id = @id`
      ).run({
        balance: JSON.stringify(newBalance),
        id,
        update_date: getSQLDatetime(),
      });
    },
    addTransferLog(log) {
      return Database.prepare(
        `INSERT INTO log (from_id, to_id, inv_id, count, date) VALUES (@from_id, @to_id, @inv_id, @count, @date)`
      ).run({
        from_id: log.from,
        to_id: log.to,
        inv_id: log.inv,
        count: log.count,
        date: getSQLDatetime(),
      });
    },
    backup() {
      const backupDir = path.join('./backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      Database.backup(`backup/backup-${Date.now()}.db`);
    },
    async exportXlsx(invs, places) {
      const backupDir = path.join('./export');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('لیست کالا');
      sheet.views = [
        {
          rightToLeft: true,
        },
      ];
      sheet.columns = [
        { header: 'عنوان', key: 'title', width: 32 },
        { header: 'مکان', key: 'place', width: 20 },
        { header: 'موجودی', key: 'count', width: 10 },
        { header: 'نوع', key: 'type', width: 15 },
        { header: 'کد بیت المال', key: 'bcode', width: 15 },
        { header: 'کد کالا', key: 'kcode', width: 15 },
      ];
      invs.forEach((inv) => {
        sheet.addRow({
          title: inv.title,
          place: places[inv.place].title,
          count: inv.count,
          type: inv.is_cons === 1 ? 'مصرفی' : 'غیرمصرفی',
          bcode: inv.b_code,
          kcode: inv.k_code,
        });
      });
      await workbook.xlsx.writeFile(`export/export-${Date.now()}.xlsx`);
    },
    changeInvCount(invId, placeId, newCount) {
      const invObj = Database.prepare(
        `SELECT balance FROM inventory WHERE id = ?`
      ).get(invId);
      const invBalance = JSON.parse(invObj.balance);
      const newBalance = invBalance;
      newBalance[placeId] = newCount;
      Database.prepare(`UPDATE inventory SET balance = ? WHERE id = ?`).run(
        JSON.stringify(newBalance),
        invId
      );
      const invs = Database.prepare('SELECT * FROM inventory').all();
      return invs;
    },
    deleteInv(invId, placeId) {
      const invObj = Database.prepare(
        `SELECT balance FROM inventory WHERE id = ?`
      ).get(invId);
      const invBalance = JSON.parse(invObj.balance);
      if (Object.keys(invBalance).length === 1) {
        Database.prepare(`DELETE FROM inventory WHERE id = ?`).run(invId);
        const invs = Database.prepare('SELECT * FROM inventory').all();
        return invs;
      }
      const newBalance = invBalance;
      delete newBalance[placeId];
      Database.prepare(`UPDATE inventory SET balance = ? WHERE id = ?`).run(
        JSON.stringify(newBalance),
        invId
      );
      const invs = Database.prepare('SELECT * FROM inventory').all();
      return invs;
    },
    deletePlcae(placeId) {
      const invs = Database.prepare('SELECT * FROM inventory').all();
      invs.forEach((inv) => {
        const invBalance = JSON.parse(inv.balance);
        if (invBalance[placeId]) {
          if (Object.keys(invBalance).length === 1) {
            Database.prepare(`DELETE FROM inventory WHERE id = ?`).run(inv.id);
          } else {
            delete invBalance[placeId];
            Database.prepare(
              `UPDATE inventory SET balance = ? WHERE id = ?`
            ).run(JSON.stringify(invBalance), inv.id);
          }
        }
      });
      Database.prepare(`DELETE FROM place WHERE id = ?`).run(placeId);
      const places = Database.prepare('SELECT * FROM place').all();
      return places;
    },
    addPlace(placeTitle) {
      Database.prepare(`INSERT INTO place (title) VALUES (@title)`).run({
        title: placeTitle,
      });
      const places = Database.prepare('SELECT * FROM place').all();
      return places;
    },
  },
});

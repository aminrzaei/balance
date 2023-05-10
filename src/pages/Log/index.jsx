import { useState } from 'react';
import { Table, Text } from '@mantine/core';
import moment from 'jalali-moment';

const Log = () => {
  const [logs, setLogs] = useState(
    window.electron.dataBase.getAll('log').reverse()
  );
  const [invs, setInvs] = useState(() => {
    const tempInvs = window.electron.dataBase.getAll('inventory');
    const tempObj = {};
    tempInvs.forEach((inv) => {
      tempObj[inv.id] = {
        title: inv.title,
      };
    });
    return tempObj;
  });
  const [places, setPlaces] = useState(() => {
    const tempPlaces = window.electron.dataBase.getAll('place');
    const tempObj = {};
    tempPlaces.forEach((place) => {
      tempObj[place.id] = {
        title: place.title,
      };
    });
    return tempObj;
  });

  const rows = logs.map((log) => {
    return (
      <tr key={log.id}>
        <td>{places[log.from_id].title}</td>
        <td>{places[log.to_id].title}</td>
        <td>{invs[log.inv_id].title}</td>
        <td>{log.count}</td>
        <td style={{ fontSize: '18px' }}>
          {moment(log.date).locale('fa').format('HH:mm:ss - YYYY-MM-DD')}
        </td>
      </tr>
    );
  });
  return (
    <div>
      <Text my={15} size="xl">
        تاریخچه انتقالات
      </Text>
      <Table striped highlightOnHover withColumnBorders>
        <thead>
          <tr>
            <th>از</th>
            <th>به</th>
            <th>کالا</th>
            <th>تعداد</th>
            <th>تاریخ انتقال</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

export default Log;

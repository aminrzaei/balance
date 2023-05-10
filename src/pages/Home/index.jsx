/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Table,
  TextInput,
  Select,
  ActionIcon,
  NumberInput,
} from '@mantine/core';
import moment from 'jalali-moment';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  UploadIcon,
} from '@primer/octicons-react';
import { useNavigate, useLocation } from 'react-router';

const Home = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [invs, setInvs] = useState(() => {
    const temp = [];
    const tempInvs = window.electron.dataBase.getAll('inventory');
    tempInvs.reverse().forEach((inv) => {
      const balance = JSON.parse(inv.balance);
      Object.entries(balance).forEach(([place, count]) => {
        temp.push({
          oid: inv.id,
          id: inv.title + place,
          title: inv.title,
          place,
          count,
          k_code: inv.k_code,
          b_code: inv.b_code,
          is_cons: inv.is_cons,
          create_date: inv.create_date,
          update_date: inv.update_date,
        });
      });
    });
    return temp;
  });
  const [tInvs, setTInvs] = useState(invs);
  const [places] = useState(() => {
    const tempObj = {};
    const tempPlaces = window.electron.dataBase.getAll('place');
    tempPlaces.forEach((place) => {
      tempObj[place.id] = {
        title: place.title,
      };
    });
    return tempObj;
  });
  const [dropDownPlaces] = useState(() => {
    const tempPlaces = window.electron.dataBase.getAll('place');
    return tempPlaces.map((place) => {
      return { value: String(place.id), label: place.title };
    });
  });

  const [searchVal, setSearchVal] = useState('');
  const [isConsSelect, setIsConsSelect] = useState();
  const [placeSelect, setPlaceSelect] = useState();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (state) {
      const elem = document.getElementById(state);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [state]);

  useEffect(() => {
    let temp = invs;
    if (placeSelect >= 0) {
      temp = temp.filter((inv) => {
        return inv.place === placeSelect;
      });
    }
    if (isConsSelect >= 0) {
      temp = temp.filter((inv) => {
        return inv.is_cons === isConsSelect;
      });
    }
    temp = temp.filter((inv) => {
      const doTitleContain = inv.title.includes(searchVal);
      const doBCodeContain = inv.b_code.includes(searchVal);
      const doKCodeContain = inv.k_code.includes(searchVal);
      if (doTitleContain || doBCodeContain || doKCodeContain) return true;
      return false;
    });
    setTInvs(temp);
  }, [searchVal, isConsSelect, placeSelect, invs]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setIsExporting(false);
    }, 10000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [isExporting]);

  const onSearch = (e) => {
    setSearchVal(e.currentTarget.value);
  };

  const onIsConsSelect = (val) => {
    setIsConsSelect(val);
  };

  const onPlaceSelect = (val) => {
    setPlaceSelect(val);
  };

  const onChangeCount = async (invId, placeId, newCount) => {
    if (newCount < 0) return;
    const tempInvs = await window.electron.dataBase.changeInvCount(
      invId,
      placeId,
      newCount
    );
    const temp = [];
    tempInvs.forEach((inv) => {
      const balance = JSON.parse(inv.balance);
      Object.entries(balance).forEach(([place, count]) => {
        temp.push({
          oid: inv.id,
          id: inv.title + place,
          title: inv.title,
          place,
          count,
          k_code: inv.k_code,
          b_code: inv.b_code,
          is_cons: inv.is_cons,
          create_date: inv.create_date,
          update_date: inv.update_date,
        });
      });
    });
    setInvs(temp);
  };

  const onDelete = async (invId, placeId) => {
    const tempInvs = await window.electron.dataBase.deleteInv(invId, placeId);
    const temp = [];
    tempInvs.forEach((inv) => {
      const balance = JSON.parse(inv.balance);
      Object.entries(balance).forEach(([place, count]) => {
        temp.push({
          oid: inv.id,
          id: inv.title + place,
          title: inv.title,
          place,
          count,
          k_code: inv.k_code,
          b_code: inv.b_code,
          is_cons: inv.is_cons,
          create_date: inv.create_date,
          update_date: inv.update_date,
        });
      });
    });
    setInvs(temp);
  };
  const RenederRow = ({ inv }) => {
    const {
      id,
      title,
      count,
      place,
      is_cons,
      b_code,
      k_code,
      oid,
      create_date,
      update_date,
    } = inv;
    const [newCount, setNewCount] = useState(count);
    return (
      <tr
        key={id}
        id={id}
        style={state === id ? { backgroundColor: '#2f3169' } : {}}
      >
        <td>{title}</td>
        <td>{places[place].title}</td>
        <td>{count}</td>
        <td>{is_cons ? 'مصرفی' : 'غیرمصرفی'}</td>
        <td>{b_code || '-'}</td>
        <td>{k_code || '-'}</td>
        <td>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <ActionIcon
              color="purple"
              onClick={() => onChangeCount(oid, place, newCount)}
            >
              <CheckIcon />
            </ActionIcon>
            <NumberInput
              style={{ width: '70px' }}
              value={newCount}
              onChange={(val) => setNewCount(val)}
            />
          </div>
        </td>
        <td>{moment(create_date).locale('fa').format('YYYY-MM-DD')}</td>
        <td>{moment(update_date).locale('fa').format('YYYY-MM-DD')}</td>
        <td>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ActionIcon
              color="red"
              radius="xl"
              variant="light"
              onClick={() => onDelete(oid, place)}
            >
              <TrashIcon size={14} />
            </ActionIcon>
          </div>
        </td>
      </tr>
    );
  };

  const rows = tInvs.map((inv) => {
    return <RenederRow inv={inv} key={inv.id} />;
  });

  return (
    <div>
      <TextInput
        value={searchVal}
        onChange={onSearch}
        label="جستجو"
        placeholder="جستجو در عنوان، کدها ..."
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Select
          style={{ width: '100%', margin: '10px 5px 20px 5px' }}
          label="مکان نگهداری"
          placeholder="انتخاب مکان نگهداری"
          data={[{ value: -1, label: 'همه مکان ها' }, ...dropDownPlaces]}
          value={placeSelect}
          onChange={onPlaceSelect}
        />
        <Select
          style={{ width: '100%', margin: '10px 5px 20px 5px' }}
          label="نوع مصرفی"
          placeholder="انتخاب نوع"
          data={[
            { value: -1, label: 'هر دو' },
            { value: 0, label: 'غیرمصرفی' },
            { value: 1, label: 'مصرفی' },
          ]}
          value={isConsSelect}
          onChange={onIsConsSelect}
        />
      </div>
      <Table striped highlightOnHover withColumnBorders mt={10}>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>مکان</th>
            <th>موجودی</th>
            <th>نوع</th>
            <th>کد بیت المال</th>
            <th>کد کالا</th>
            <th>تغییر تعداد</th>
            <th>تاریخ ثبت</th>
            <th>تاریخ آخرین تغییر</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
        <ActionIcon
          color={isExporting ? 'teal' : 'indigo'}
          title="گرفتن خروجی اکسل"
          disabled={isExporting}
          size="xl"
          radius="xl"
          variant="filled"
          onClick={() => {
            setIsExporting(true);
            window.electron.dataBase.exportXlsx(tInvs, places);
          }}
        >
          {isExporting ? <CheckIcon size={20} /> : <UploadIcon size={20} />}
        </ActionIcon>
      </div>
    </div>
  );
};

export default Home;

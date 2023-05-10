import {
  Autocomplete,
  TextInput,
  Select,
  Text,
  Checkbox,
  Button,
  NumberInput,
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const AddInventory = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    title: '',
    bCode: '',
    kCode: '',
    count: '',
    place: '',
  });
  const [places, setPlaces] = useState(() => {
    return window.electron.dataBase.getAll('place').map((place) => {
      return { value: String(place.id), label: place.title };
    });
  });
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
  const [placess] = useState(() => {
    const tempObj = {};
    const tempPlaces = window.electron.dataBase.getAll('place');
    tempPlaces.forEach((place) => {
      tempObj[place.id] = {
        title: place.title,
      };
    });
    return tempObj;
  });
  const [title, setTitle] = useState('');
  const [bCode, setBCode] = useState('');
  const [kCode, setKCode] = useState('');
  const [place, setPlace] = useState('');
  const [isCons, setIsCons] = useState(false);
  const [count, setCount] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const addInventory = () => {
    setIsLoading(true);
    if (!title) {
      setErrors((prev) => {
        return { ...prev, title: 'عنوان کالا نیاز است' };
      });
      setIsLoading(false);
      return;
    }
    if (!place) {
      setErrors((prev) => {
        return { ...prev, place: 'مکان کالا نیاز است' };
      });
      setIsLoading(false);

      return;
    }
    if (count <= 0) {
      setErrors((prev) => {
        return { ...prev, count: 'تعداد صحیح وارد کنید' };
      });
      setIsLoading(false);

      return;
    }
    setErrors({
      title: '',
      count: '',
      place: '',
    });
    const newInventory = {
      title,
      bCode,
      kCode,
      isCons: isCons ? 1 : 0,
      balance: JSON.stringify({ [place]: count }),
    };
    window.electron.dataBase.addInventory(newInventory);
    navigate('/', { replace: true });
    setIsLoading(false);
  };
  return (
    <div>
      <Text my={15} size="xl">
        افزودن کالا
      </Text>
      <Autocomplete
        placeholder="عنوان کالا را وارد نمایید ..."
        label="عنوان"
        error={errors.title}
        value={title}
        onItemSubmit={(e) =>
          navigate('/', {
            state: e.value,
          })
        }
        onChange={(val) => setTitle(val)}
        data={invs.map((inv) => {
          return {
            value: inv.id,
            label: `${inv.title} [${inv.count}] -- (${
              placess[inv.place].title
            })`,
          };
        })}
        my={15}
      />
      <TextInput
        placeholder="کد بیت المال را وارد کنید ..."
        label="کد بیت المال"
        value={bCode}
        onChange={(e) => setBCode(e.currentTarget.value)}
        mb={15}
      />
      <TextInput
        placeholder="کد کالا را وارد کنید ..."
        label="کد کالا"
        value={kCode}
        onChange={(e) => setKCode(e.currentTarget.value)}
        mb={23}
      />
      <Checkbox
        label="کالای مصرفی؟"
        color="pink"
        value={isCons}
        onChange={(event) => setIsCons(event.currentTarget.checked)}
        mb={20}
      />
      <Select
        label="مکان نگهداری"
        placeholder="یک مکان را انتخاب کنید ..."
        value={place}
        onChange={setPlace}
        data={places}
        mb={15}
        error={errors.place}
      />
      <NumberInput
        defaultValue={count}
        placeholder="تعداد موجودی را وارد کنید ..."
        label="موجودی"
        error={errors.count}
        value={count}
        onChange={(val) => setCount(val)}
      />
      <Button
        color="indigo"
        fullWidth
        mt={50}
        pt={3}
        loading={isLoading}
        onClick={() => addInventory()}
      >
        افزودن کالا
      </Button>
    </div>
  );
};

export default AddInventory;

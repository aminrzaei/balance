import { useEffect, useState } from 'react';
import { Select, Slider, Text, Button } from '@mantine/core';
import { useNavigate } from 'react-router';

const Transfer = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState(() => {
    return window.electron.dataBase.getAll('place').map((place) => {
      return { value: String(place.id), label: place.title };
    });
  });
  const [invs, setInvs] = useState(
    window.electron.dataBase.getAll('inventory')
  );
  const [fromInvs, setFromInvs] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);

  const [inv, setInv] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [countToTransfer, setCountToTransfer] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    from: '',
    inv: '',
    to: '',
  });

  const transferInventory = () => {
    setIsLoading(true);
    if (!from) {
      setErrors((prev) => {
        return { ...prev, from: 'مبدا کالا نیاز است' };
      });
      setIsLoading(false);

      return;
    }
    if (!inv) {
      setErrors((prev) => {
        return { ...prev, inv: ' کالا نیاز است' };
      });
      setIsLoading(false);

      return;
    }
    if (!to) {
      setErrors((prev) => {
        return { ...prev, to: 'مقصد کالا نیاز است' };
      });
      setIsLoading(false);

      return;
    }
    setErrors({
      from: '',
      inv: '',
      to: '',
    });
    const invToPatch = invs.find((i) => i.id === +inv);
    const prevBalance = JSON.parse(invToPatch.balance);
    const newFromBalance = prevBalance[from] - countToTransfer;
    const newToBalance = prevBalance[to]
      ? prevBalance[to]
      : 0 + countToTransfer;
    const newBalance = {
      ...prevBalance,
      [from]: newFromBalance,
      [to]: newToBalance,
    };
    const log = {
      from,
      to,
      count: countToTransfer,
      inv,
    };
    window.electron.dataBase.updateInventoryBalance(inv, newBalance);
    window.electron.dataBase.addTransferLog(log);
    setIsLoading(false);
    navigate('/log', { replace: true });
  };
  useEffect(() => {
    const relatedInvs = invs
      .filter((kala) => {
        const balance = JSON.parse(kala.balance);
        const kalaPlaces = Object.keys(balance);
        if (kalaPlaces.includes(String(from))) return true;
        return false;
      })
      .map((kala) => {
        return {
          value: String(kala.id),
          label: kala.title,
          count: JSON.parse(kala.balance)[from],
        };
      });
    setFromInvs(relatedInvs);
    setInv('');
    setCountToTransfer(0);
    setTo('');
  }, [from, invs]);

  useEffect(() => {
    const available = fromInvs.find((av) => av.value === inv)?.count;
    if (available) setAvailableCount(available);
    setCountToTransfer(0);
  }, [inv, fromInvs]);
  return (
    <div>
      <Text my={15} size="xl">
        انتقال کالا
      </Text>
      <Select
        label="مبدا"
        placeholder="مبدا را انتخاب کنید ..."
        value={from}
        onChange={setFrom}
        data={places}
        mb={15}
        error={errors.from}
      />
      <Select
        searchable
        label="کالای انتقالی"
        placeholder="کالای انتقالی را انتخاب کنید ..."
        value={inv}
        onChange={setInv}
        data={fromInvs}
        mb={15}
        error={errors.inv}
      />
      <Text>تعداد</Text>
      <Slider
        my={15}
        min={1}
        max={availableCount}
        value={countToTransfer}
        onChange={setCountToTransfer}
        labelTransition="skew-down"
        labelTransitionDuration={150}
        labelTransitionTimingFunction="ease"
      />
      <Select
        label="مقصد"
        placeholder="مقصد را انتخاب کنید ..."
        value={to}
        onChange={setTo}
        data={places.filter((p) => p.value !== from)}
        mb={15}
        error={errors.to}
      />
      <Button
        color="indigo"
        fullWidth
        mt={50}
        pt={3}
        loading={isLoading}
        onClick={() => transferInventory()}
      >
        انتقال کالا
      </Button>
    </div>
  );
};

export default Transfer;

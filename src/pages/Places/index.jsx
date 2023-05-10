import { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  ActionIcon,
  TextInput,
  Button,
  Group,
} from '@mantine/core';
import { TrashIcon } from '@primer/octicons-react';

const Places = () => {
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState({
    id: -1,
    title: '',
  });
  const [errors, setErrors] = useState({
    title: '',
  });
  const [places, setPlaces] = useState(() => {
    const tempArr = [];
    const tempPlaces = window.electron.dataBase.getAll('place');
    tempPlaces.forEach((place, idx) => {
      tempArr.push({
        id: idx + 1,
        oid: place.id,
        title: place.title,
      });
    });
    return tempArr;
  });

  const addPlace = async () => {
    setIsLoading(true);
    if (!newPlaceTitle) {
      setErrors((pre) => {
        return { ...pre, title: 'عنوان مورد نیاز است' };
      });
      setIsLoading(false);
      return;
    }
    setErrors({
      title: '',
    });

    const tempPlaces = await window.electron.dataBase.addPlace(newPlaceTitle);
    const tempArr = [];
    tempPlaces.forEach((place, idx) => {
      tempArr.push({
        id: idx + 1,
        oid: place.id,
        title: place.title,
      });
    });
    setNewPlaceTitle('');
    setPlaces(tempArr);
    setIsLoading(false);
  };
  const onDelete = async (id) => {
    const tempPlaces = await window.electron.dataBase.deletePlcae(id);
    const tempArr = [];
    tempPlaces.forEach((place, idx) => {
      tempArr.push({
        id: idx + 1,
        oid: place.id,
        title: place.title,
      });
    });
    setPlaces(tempArr);
    setIsModalOpen(false);
  };

  const rows = places.map((place) => (
    <tr key={place.id}>
      <td>{place.id}</td>
      <td style={{ width: '100%' }}>{place.title}</td>
      <td>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionIcon
            color="red"
            radius="xl"
            variant="light"
            onClick={() => {
              setIsModalOpen(true);
              setPlaceToDelete({ oid: place.oid, title: place.title });
            }}
          >
            <TrashIcon size={14} />
          </ActionIcon>
        </div>
      </td>
    </tr>
  ));

  return (
    <div>
      <div
        style={{
          maxWidth: '800px',
          margin: '35px auto 65px auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        <TextInput
          placeholder="نام مکان مورد نظر را وارد نمایید ..."
          label="عنوان مکان"
          w="100%"
          error={errors.title}
          value={newPlaceTitle}
          onChange={(e) => setNewPlaceTitle(e.currentTarget.value)}
        />
        <Button
          color="teal"
          mt={25}
          ml={10}
          pt={3}
          loading={isLoading}
          onClick={() => addPlace()}
        >
          افزودن مکان
        </Button>
      </div>
      <Table
        striped
        highlightOnHover
        withColumnBorders
        mt={10}
        w={800}
        mx="auto"
      >
        <thead>
          <tr>
            <th>شماره</th>
            <th>عنوان</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <Modal
        centered
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="حذف مکان!"
      >
        <h3>آیا از حذف مکان &quot;{placeToDelete.title}&quot; مطمعن هستید؟</h3>
        <p style={{ color: '#e03131' }}>
          !!! کلیه کالاهای موجو در این مکان نیز حذف میشوند !!!
        </p>
        <Group mt={25}>
          <Button
            color="teal"
            variant="outline"
            w="65%"
            onClick={() => setIsModalOpen(false)}
          >
            خیر
          </Button>
          <Button color="red" onClick={() => onDelete(placeToDelete.oid)}>
            بله، حذف شود
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Places;

import { useCallback, useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export interface IFood {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

export type FoodInput = Omit<IFood, 'id' | 'available'>

export function Dashboard() {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFood() {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    loadFood();
  }, [])

  const handleAddFood = useCallback(async (food: FoodInput) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods((prev) => [...prev, response.data])
    } catch (error) {
      console.log(error);
    }
  }, [])

  const handleUpdateFood = useCallback(async (food: FoodInput) => {
    try {
      const foodUpdated = await api.put<IFood>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const newFoods = foods.map((food) => 
        food.id === foodUpdated.data.id ? foodUpdated.data : food
      )

      setFoods(newFoods);
    } catch (error) {
      console.log(error);
    }
  }, [editingFood, foods])

  const handleDeleteFood = useCallback(async (id: number) => {
    try {
      await api.delete(`/foods/${id}`);

      setFoods((prev) => prev.filter((food) => food.id !== id))
    } catch (error) {
      console.log(error);
    }
  }, [])

  const toggleModal = useCallback(() => {
    setModalOpen((prev) => !prev);
  }, [])

  const toggleEditModal = useCallback(() => {
    setEditModalOpen((prev) => !prev);
  }, [])

  const handleEditFood = useCallback((food: IFood) => {
    setEditingFood(food);

    setEditModalOpen(true);
  }, [])

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />

      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}
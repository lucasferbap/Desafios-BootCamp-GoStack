/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  extras: Extra[];
  category: number;
  thumbnail_url: string;
  image_url: string;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food); // usado
  const [extras, setExtras] = useState<Extra[]>([]); // usado
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      const { data } = await api.get<Food>(`foods/${routeParams.id}`);

      data.formattedPrice = formatValue(data.price);

      data.extras.map(extra => (extra.quantity = 0));

      setExtras(data.extras);

      setFood(data);

      const favoriteFood = await api.get<Food[]>(`favorites`);

      favoriteFood.data.find(favorite => favorite.id === routeParams.id)
        ? setIsFavorite(true)
        : setIsFavorite(false);
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const extraIndex = extras.findIndex(extra => extra.id === id);
    extras[extraIndex].quantity += 1;
    setExtras([...extras]);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const extraIndex = extras.findIndex(extra => extra.id === id);
    extras[extraIndex].quantity -= 1;
    if (extras[extraIndex].quantity < 1) {
      extras[extraIndex].quantity = 0;
    }
    setExtras([...extras]);
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    const updatedFoodQuantity = foodQuantity + 1;
    setFoodQuantity(updatedFoodQuantity);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    let updatedFoodQuantity = foodQuantity - 1;
    if (updatedFoodQuantity < 1) {
      updatedFoodQuantity = 1;
    }
    setFoodQuantity(updatedFoodQuantity);
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    if (isFavorite) {
      setIsFavorite(false);
      await api.delete(`favorite/${routeParams.id}`);
    } else {
      setIsFavorite(true);
      await api.post('favorite', {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price.toFixed(2),
        category: food.category,
        image_url: food.image_url,
        thumbnail_url: food.thumbnail_url,
      });
    }
  }, [isFavorite, routeParams.id, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
    const totalFood = foodQuantity * food.price;
    const totalExtras = extras.reduce(
      (total, extra) => (total += extra.quantity * extra.value),
      0,
    );
    return formatValue(totalFood + totalExtras);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
    await api.post('orders', {
      product_id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      thumbnail_url: food.thumbnail_url,
      extras: extras.filter(extra => extra.quantity !== 0),
    });
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={20}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={20}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={20}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;

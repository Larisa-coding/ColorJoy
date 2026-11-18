import type { AgeGroup, Group } from './types';

export type Collection = {
  id: string;
  title: string;
  description: string;
  group: Group | 'licensed';
  age: AgeGroup;
  order: number;
  status: 'ready' | 'soon';
  tint: string;
};

export const categoryOrder: Array<{ id: Group | 'licensed'; title: string }> = [
  { id: 'animals', title: 'Животные' },
  { id: 'nature', title: 'Природа' },
  { id: 'space', title: 'Космос' },
  { id: 'transport', title: 'Транспорт' },
  { id: 'robots', title: 'Роботы' },
  { id: 'fairy', title: 'Сказки' },
  { id: 'dinos', title: 'Динозавры' },
  { id: 'jobs', title: 'Профессии' },
  { id: 'food', title: 'Еда' },
  { id: 'holidays', title: 'Праздники' },
  { id: 'sports', title: 'Спорт и игры' },
  { id: 'cute', title: 'Милые персонажи' },
  { id: 'licensed', title: 'Любимые герои' },
];

const col = (
  id: string,
  title: string,
  description: string,
  group: Group | 'licensed',
  age: AgeGroup,
  order: number,
  tint: string,
  status: 'ready' | 'soon' = 'ready',
): Collection => ({ id, title, description, group, age, order, tint, status });

export const collections: Collection[] = [
  col('cats', 'Котики', 'Мягкие котики для первых раскрасок', 'animals', '3-5', 1, '#ffd0e0'),
  col('puppies', 'Щенки', 'Весёлые щенки и их игры', 'animals', '3-5', 2, '#ffe0c2'),
  col('wild', 'Дикие животные', 'Львята, слонята и жирафы', 'animals', '4-7', 3, '#ffe7a8'),
  col('forest', 'Лесные зверята', 'Лисы, ёжики и белочки', 'animals', '4-7', 4, '#d9f2d0'),
  col('sea-animals', 'Морские животные', 'Киты, дельфины и рыбки', 'animals', '3-5', 5, '#d5f0ff'),
  col('birds', 'Птицы', 'Птички и совы', 'animals', '4-7', 6, '#e7f6c8'),
  col('insects', 'Насекомые', 'Бабочки и пчёлки', 'animals', '3-5', 7, '#fff0b8'),
  col('farm', 'Ферма', 'Коровки, свинки, курочки и овечки', 'animals', '3-5', 8, '#f8e7c4'),
  col('cute-beasts', 'Милые зверушки', 'Зайки и панды', 'animals', '3-5', 9, '#ffe0ea'),

  col('forest-scene', 'Лес', 'Деревья, грибы и поляны', 'nature', '4-7', 1, '#d7f0cf'),
  col('flowers', 'Цветы', 'Тюльпаны и букеты', 'nature', '3-5', 2, '#ffd6ea'),
  col('trees', 'Деревья', 'Дуб и яблоня', 'nature', '4-7', 3, '#cfe8c4'),
  col('garden', 'Сад', 'Грядки и лейки', 'nature', '4-7', 4, '#e5f6c9'),
  col('rainbow', 'Радуга', 'Большая радуга после дождя', 'nature', '3-5', 5, '#ffe7f4'),
  col('seasons', 'Времена года', 'Весна, лето, осень и зима', 'nature', '4-7', 6, '#e7f4ff'),
  col('underwater', 'Подводный мир', 'Кораллы и ракушки', 'nature', '4-7', 7, '#d7f4ff'),
  col('landscapes', 'Пейзажи', 'Горы, озеро и холмы', 'nature', '6-9', 8, '#e5f0d8'),

  col('planets', 'Планеты', 'Земля и Сатурн', 'space', '4-7', 1, '#e4e4ff'),
  col('rockets', 'Ракеты', 'Полёт к звёздам', 'space', '3-5', 2, '#ffe0c8'),
  col('astronauts', 'Космонавты', 'Прогулка среди звёзд', 'space', '4-7', 3, '#dcecff'),
  col('stars', 'Звёзды', 'Луна и большая звезда', 'space', '3-5', 4, '#fff3c4'),
  col('aliens', 'Инопланетяне', 'Добрый гость с другой планеты', 'space', '4-7', 5, '#d9ffe8'),
  col('spaceships', 'Космические корабли', 'Тарелка и корабль', 'space', '6-9', 6, '#e6e9ff'),
  col('galaxies', 'Галактики', 'Звёздный вихрь', 'space', '6-9', 7, '#efe4ff'),

  col('cars', 'Машинки', 'Городские автомобили', 'transport', '3-5', 1, '#ffe1c7'),
  col('trucks', 'Грузовики', 'Большой грузовик', 'transport', '4-7', 2, '#ffe7b0'),
  col('planes', 'Самолёты', 'Самолёт в небе', 'transport', '4-7', 3, '#d9f1ff'),
  col('trains', 'Поезда', 'Весёлый поезд', 'transport', '3-5', 4, '#ffe0e4'),
  col('ships', 'Корабли', 'Парусник и пароход', 'transport', '4-7', 5, '#d5f3ff'),
  col('moto', 'Мотоциклы', 'Быстрый мотоцикл', 'transport', '6-9', 6, '#ffe6d4'),
  col('special', 'Спецтехника', 'Экскаватор и пожарная', 'transport', '4-7', 7, '#ffe8a8'),
  col('race', 'Гоночные автомобили', 'Машина для гонки', 'transport', '6-9', 8, '#ffd6d6'),

  col('robots', 'Роботы', 'Дружелюбные роботы', 'robots', '4-7', 1, '#e5e9ff'),
  col('mecha', 'Огромные механические герои', 'Большой добрый мех', 'robots', '6-9', 2, '#e7e4ff'),
  col('robot-vehicles', 'Роботы-транспорт', 'Машина, которая умеет быть роботом', 'robots', '6-9', 3, '#e0f0ff'),
  col('fantasy-machines', 'Фантастические машины', 'Чудо-машина из мастерской', 'robots', '6-9', 4, '#efe4ff'),
  col('mech-creatures', 'Механические существа', 'Щенок из шестерёнок', 'robots', '4-7', 5, '#e5fff4'),

  col('princesses', 'Принцессы', 'Принцесса Роза', 'fairy', '4-7', 1, '#ffd9ea'),
  col('castles', 'Замки', 'Сказочный замок', 'fairy', '4-7', 2, '#eee6ff'),
  col('fairies', 'Феи', 'Маленькая фея', 'fairy', '3-5', 3, '#f3e4ff'),
  col('unicorns', 'Единороги', 'Единорог с облачком', 'fairy', '3-5', 4, '#ffe6f6'),
  col('dragons', 'Драконы', 'Добрый дракон', 'fairy', '6-9', 5, '#e5ffe8'),
  col('magic-forests', 'Волшебные леса', 'Светящиеся деревья', 'fairy', '4-7', 6, '#e4ffe4'),
  col('mermaids', 'Русалки', 'Русалка и жемчужина', 'fairy', '4-7', 7, '#d9f6ff'),
  col('magic-creatures', 'Волшебные существа', 'Лисёнок со звездой', 'fairy', '4-7', 8, '#ffe9f8'),

  col('trex', 'Тираннозавры', 'Улыбчивый тираннозаврик', 'dinos', '4-7', 1, '#e7f8c8'),
  col('triceratops', 'Трицератопсы', 'Трицератопс с воротником', 'dinos', '4-7', 2, '#e5f6d4'),
  col('dino-babies', 'Динозавры с детёнышами', 'Большой динозавр и малыш', 'dinos', '4-7', 3, '#f3f8d4'),
  col('prehistoric', 'Доисторический мир', 'Вулкан и папоротники', 'dinos', '6-9', 4, '#efe7cf'),
  col('dino-jungle', 'Динозавры в джунглях', 'Стегозавр среди листьев', 'dinos', '6-9', 5, '#ddf5c8'),

  col('doctors', 'Врачи', 'Добрый доктор', 'jobs', '4-7', 1, '#e7fff4'),
  col('builders', 'Строители', 'Строитель и домик', 'jobs', '4-7', 2, '#ffe8c4'),
  col('firefighters', 'Пожарные', 'Пожарный герой', 'jobs', '4-7', 3, '#ffd9d4'),
  col('police', 'Полицейские', 'Дружелюбный полицейский', 'jobs', '4-7', 4, '#e0ecff'),
  col('teachers', 'Учителя', 'Учитель с книгой', 'jobs', '4-7', 5, '#efe7ff'),
  col('chefs', 'Повара', 'Повар и тортик', 'jobs', '3-5', 6, '#fff0d8'),
  col('job-astronauts', 'Космонавты', 'Космонавт на работе', 'jobs', '6-9', 7, '#e4f1ff'),

  col('fruits', 'Фрукты', 'Яблоко и ваза с фруктами', 'food', '3-5', 1, '#ffe0ea'),
  col('veggies', 'Овощи', 'Весёлые овощи', 'food', '3-5', 2, '#e5f8cf'),
  col('sweets', 'Сладости', 'Банка конфет', 'food', '3-5', 3, '#ffe4f4'),
  col('icecream', 'Мороженое', 'Рожок с шариками', 'food', '3-5', 4, '#fff0f6'),
  col('cakes', 'Тортики', 'Праздничный торт', 'food', '3-5', 5, '#ffe8f1'),
  col('pizza', 'Пицца', 'Большая пицца', 'food', '4-7', 6, '#ffe7c8'),
  col('funny-food', 'Забавная еда', 'Пончик с улыбкой', 'food', '3-5', 7, '#fff4d6'),

  col('new-year', 'Новый год', 'Ёлка и снеговик', 'holidays', '3-5', 1, '#e7fff4'),
  col('birthday', 'День рождения', 'Подарок с бантом', 'holidays', '3-5', 2, '#ffe4f2'),
  col('halloween', 'Хэллоуин', 'Добрая тыква', 'holidays', '4-7', 3, '#ffe6c2'),
  col('spring-holiday', 'Весна', 'Корзина с цветами', 'holidays', '3-5', 4, '#f3ffe0'),
  col('summer-holiday', 'Лето', 'Воздушный змей', 'holidays', '4-7', 5, '#e5f6ff'),
  col('winter-holiday', 'Зима', 'Тёплые варежки', 'holidays', '3-5', 6, '#eef7ff'),
  col('easter', 'Пасха', 'Расписное яйцо', 'holidays', '3-5', 7, '#fff6d9'),

  col('football', 'Футбол', 'Мяч и ворота', 'sports', '4-7', 1, '#e5ffe8'),
  col('basketball', 'Баскетбол', 'Мяч и кольцо', 'sports', '6-9', 2, '#ffe8d4'),
  col('bikes', 'Велосипеды', 'Прогулка на велосипеде', 'sports', '4-7', 3, '#e7f7ff'),
  col('toys', 'Игрушки', 'Кубики и мячик', 'sports', '3-5', 4, '#fff1d8'),
  col('boardgames', 'Настольные игры', 'Игра на столе', 'sports', '6-9', 5, '#f3eaff'),
  col('sport-heroes', 'Спортивные герои', 'Маленький чемпион', 'sports', '4-7', 6, '#e7fff6'),

  col('cute-kittens', 'Милые котята', 'Два котёнка вместе', 'cute', '3-5', 1, '#ffe0ea'),
  col('bear-cubs', 'Забавные медвежата', 'Мишка и горшочек мёда', 'cute', '3-5', 2, '#ffe7c8'),
  col('animal-families', 'Семейства зверят', 'Утиная семья', 'cute', '3-5', 3, '#e7fff0'),
  col('little-monsters', 'Маленькие монстрики', 'Добрый монстрик', 'cute', '4-7', 4, '#f0e6ff'),
  col('fantasy-beings', 'Весёлые фантазийные существа', 'Пушистый фантазёр', 'cute', '4-7', 5, '#ffeaf8'),
  col('friendly-families', 'Дружные семейки животных', 'Семейка зайчат', 'cute', '3-5', 6, '#f8ffe4'),

  col('soon-mimimishki', 'Мимимишки', 'Появится, когда будут лицензированные материалы', 'licensed', '3-5', 1, '#ffe7c2', 'soon'),
  col('soon-three-cats', 'Три кота', 'Появится, когда будут лицензированные материалы', 'licensed', '3-5', 2, '#ffe0ea', 'soon'),
  col('soon-barboskiny', 'Барбоскины', 'Появится, когда будут лицензированные материалы', 'licensed', '4-7', 3, '#e7f0ff', 'soon'),
  col('soon-transformers', 'Трансформеры', 'Появится, когда будут лицензированные материалы', 'licensed', '6-9', 4, '#e6e9ff', 'soon'),
  col('soon-paw-patrol', 'Щенячий патруль', 'Появится, когда будут лицензированные материалы', 'licensed', '3-5', 5, '#e5f4ff', 'soon'),
  col('soon-peppa', 'Свинка Пеппа', 'Появится, когда будут лицензированные материалы', 'licensed', '3-5', 6, '#ffd6ea', 'soon'),
  col('soon-ladybug', 'Леди Баг', 'Появится, когда будут лицензированные материалы', 'licensed', '6-9', 7, '#ffe0e8', 'soon'),
  col('soon-spiderman', 'Человек-паук', 'Появится, когда будут лицензированные материалы', 'licensed', '6-9', 8, '#ffe0e0', 'soon'),
];

export const popularCollectionIds = ['cats', 'trex', 'rockets', 'unicorns', 'cars', 'cakes', 'bear-cubs', 'new-year'];

export const getCollection = (id: string): Collection | undefined => collections.find((item) => item.id === id);

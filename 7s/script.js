(() => {
  const config = {
    dotMinRad  : 5,
    dotMaxRad  : 20,
    sphereRad  : 400,
    bigDotRad  : 45,
    mouseSize  : 160,
    massFactor : 0.002,
    defColor   : 'rgba(30, 30, 30, 0.9)',
    smooth     : 0.75,
  } // Параметры точек

  const TWO_PI = 2 * Math.PI;
  const canvas = document.querySelector('canvas'); // Создание полотна
  const ctx    = canvas.getContext('2d');

  let w, h, mouse, dots;

  class Dot {
    constructor(r) {
      this.pos   = {x: mouse.x, y: mouse.y}
      this.vel   = {x: 0, y: 0}
      this.rad   = r || random(config.dotMinRad, config.dotMaxRad);
      this.mass  = this.rad * config.massFactor;
      this.color = config.defColor;
    } // Задание параметров точки

    draw(x, y) {
      this.pos.x = x || this.pos.x + this.vel.x;
      this.pos.y = y || this.pos.y + this.vel.y;
      createCircle(this.pos.x, this.pos.y, this.rad, true, this.color);
      createCircle(this.pos.x, this.pos.y, this.rad, false, config.defColor);
    } // Метод отрисовки на полотне
  }

  function updateDots() {
    for (let i = 0; i < dots.length; i++) {
      let acc = {x: 0, y: 0} // Накапливаем ускорения притяжения

      for (let j = 0; j < dots.length; j++) {
        if (i == j) continue;
        let [a, b] = [dots[i], dots[j]];

        let delta  = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y} // Разница позиций первой и второй точек
        let dist   = Math.sqrt( delta.x * delta.x + delta.y * delta.y) || 1; // Расстояние между точками a и b
        let force  = (dist - config.sphereRad) / dist * b.mass; // Вычисляем ускорение

        if (j == 0) {
          let alpha = config.mouseSize / dist;
          a.color   = 'rgba(30, 30, 30, ${alpha})';

          dist < config.mouseSize ? force = (dist - config.mouseSize) * b.mass : force = a.mass;
        } // отталкивание для курсора

        acc.x     += delta.x * force; // Устанавливаем ускорение для каждой точки
        acc.y     += delta.y * force;
      }

      dots[i].vel.x = dots[i].vel.x * config.smooth + acc.x * dots[i].mass; // Добавим ускорение к скорости текущей точки по x (трение и масса)
      dots[i].vel.y = dots[i].vel.y * config.smooth + acc.y * dots[i].mass; // Добавим ускорение к скорости текущей точки по y (трение и масса)
    }

    dots.map(e => e == dots[0] ? e.draw(mouse.x, mouse.y) : e.draw()); // Если это курсорная точка, передаем координаты мыши, иначе рисуем другие точки
  }

  function createCircle(x, y, rad, fill, color) {
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TWO_PI);
    ctx.closePath();
    fill ? ctx.fill() : ctx.stroke();
  } // Формирование точки

  function random(min, max) {
    return Math.random() * (max - min) + min;
  } // Возвращаем точки различного радиуса

  function init() {
    w     = canvas.width  = innerWidth;
    h     = canvas.height = innerHeight;

    mouse = {x: w / 2, y: h / 2, down: false}
    dots  = [];

    dots.push(new Dot(config.bigDotRad)); // Точка вместо курсора
  } // Инициализация основных объектов

  function loop() {
    ctx.clearRect(0, 0, w, h);

    if (mouse.down) { dots.push(new Dot()); }
    updateDots();

    window.requestAnimationFrame(loop);
  } // Рекурсивная функция по отрисовке точек

  function line(x,y,x2,y2) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  init(); // инициализируем
  loop(); // отрисовываем

  function setPos({layerX, layerY}) {
    [mouse.x, mouse.y] = [layerX, layerY];
  } // Позиция мышки

  function isDown() {
    mouse.down = !mouse.down;
  } // Изменяем состояние down по нажатию

  canvas.addEventListener('mousemove', setPos); // Отлавливаем перемещение и нажатия
  window.addEventListener('mousedown', isDown);
  window.addEventListener('mouseup'  , isDown);
})();

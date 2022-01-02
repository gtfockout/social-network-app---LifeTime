const Router = require('express');
const {check} = require('express-validator');
const router = new Router();
const controller = require('./authController.js');
const authMiddleware = require('./middlewares/authMiddleware.js');
const roleMiddleware = require('./middlewares/roleMiddleware.js');

router.post('/registration', [
    check('username', "Псевдоним не может быть пустым").notEmpty(),
    check('name', "Имя не может быть пустым").notEmpty(),
    check('surname', "Фамилия не может быть пустым").notEmpty(),
    check('email', "Электронный адрес да)").isEmail(),
    check('password', "Пароль должен быть не менее 6 и не больше 12 символов").isLength({
        min: 6,
        max: 12
    }),
], controller.registration);
router.post('/login', controller.login);
router.get('/users', roleMiddleware(['ADMIN']), controller.getUsers);

module.exports = router;
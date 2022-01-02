const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User.js');
const Role = require('./models/Role.js');
const {secret} = require('./config.js');


const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    };
    return jwt.sign(payload, secret, {expiresIn: "24h"}); 
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Failed registration", errors});
            }
            const {username, name, surname, email, password} = req.body;
            const candidate = await User.findOne({username});
            if (candidate) {
                return res.status(400).json({message: "A user with the same name already exists"});
            }
            const hashPassword = bcrypt.hashSync(password, 5);
            const userRole = await Role.findOne({value: "ADMIN"});
            const user = new User({
                username,
                name,
                surname,
                email,
                password: hashPassword,
                roles: [userRole.value]
            });
            await user.save();
            return res.json({message: "User registered successfully"});
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error'});
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(400).json({message: `User with this ${username} not found`})
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({message: `Wrong password entered`});
            }
            const token = generateAccessToken(user._id, user.roles);
            return res.json({token});        
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Login error'});
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new authController();
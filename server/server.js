'use strict';

const express = require('express');

const morgan = require('morgan');

const { check, validationResult } = require('express-validator');

const dao = require('./questionari-dao.js'); // module for accessing the tasks in DB

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const adminDao = require('./admin-dao.js'); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function (email, password, done) {
        adminDao.getUser(email, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'email e/o password non corretti. Riprovare!' });

            return done(null, user);
        })
    }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    adminDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Format express-validate errors as strings
    return `${location}[${param}]: ${msg}`;
};

// init express
const app = express();
const port = 3001;

//set-up middlewares
app.use(morgan('dev'));
app.use(express.json());



// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'Non autenticato' });
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: '- lorem ipsum dolor sit amet -',
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());



/*** USER APIs ***/


// Login --> POST /sessions
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});



// Logout --> DELETE /sessions/current 
app.delete('/api/sessions/current', (req, res) => {
    req.logout();
    res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Unauthenticated user!' });;
});






/*** APIs ***/

// GET /api/questionari
app.get('/api/questionari', async (req, res) => {
    dao.getAll()
        .then((questionari) => res.json(questionari))
        .catch((err) => res.status(500).json({ error: 'DB error', desctiption: err }))
});


// GET /api/compilazioni
app.get('/api/compilazioni', isLoggedIn, async (req, res) => {
    dao.getCompilazioni()
        .then((compilazioni) => res.json(compilazioni))
        .catch((err) => res.status(500).json({ error: 'DB error', desctiption: err }))
});

// GET /api/questionari
app.get('/api/domande', async (req, res) => {
    dao.getAllDomande()
        .then((domande) => res.json(domande))
        .catch((err) => res.status(500).json({ error: 'DB error', desctiption: err }))
});


// Insert new questionario
// POST /api/questionari

app.post('/api/questionari', isLoggedIn,
    [
        check("titolo", "il titolo è vuoto").notEmpty(),
        check('creatorId', "id dell'admin non valido").isInt({ min: 0 }),
        check('nome', "il nome non è valido").notEmpty().isAlpha(),
        //check('domande.*.idQuest', "survey id inside the question is not valid").isInt({min:0}),
        //check('domande.*.idDom', "Question id is not valid").isInt({min:0}),
        check('domande.*.quesito', "la domanda non è valida").notEmpty(),
        check('domande.*.tipo', "il tipo di domanda non è valido").isInt({ min: 0, max: 1 }),
        //check('domande.*.pos', "position of question inside the survey is not valid").isInt({min:0}),
        check('domande.*.min', "il numero minimo di risposte non è valido").isInt({ min: 0, max: 10 }),
        check('domande.*.max', "il numero massimo di risposte non è valido").isInt({ min: -1, max: 10 }),
        //check('domande.*.risposte', "answers of question x are not valid").isArray({min:0, max:10})
    ],

    (req, res) => {
        // VALIDAZIONI
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ error: 'Bad Request', description: 'parametri invalidi', errors: errors.array() })

        const quest = { titolo: req.body.titolo, creatorId: req.body.creatorId, nome: req.body.nome };
        const domande = [...req.body.domande];


        let promises = []
        req.body.domande.forEach(dom => promises.push(dao.checkValidityAnswer(dom.tipo, dom.min, dom.max, dom.risposte)));

        Promise.all(promises)
            .then(() => dao.createQuestionario(quest)
                .then((newQuest) =>  { return dao.aggiungiDomande(domande, newQuest.idQuest ) })
                .then( () => res.status(200).json(domande) )
                .catch((err) => res.status(500).json({ error: 'DB error', description: err }))
            )
            .catch((err) => res.status(500).json({ error: 'DB error', description: err }))
    });


// Insert new compilazione
// POST /api/compilazioni

app.post('/api/compilazioni',
    [
        check('idQuest', "id del questionario non valido").isInt({ min: 0 }),
        check('utilizzatore', "utilizzatore non valido").notEmpty(),
        check('arrayRisposte', "array di compilazioni non valido").isArray(),
        check('arrayRisposte.*.idDom', "id domanda nell'array di compilazioni non valido").isInt({ min: 0 })

    ],

    (req, res) => {
        // VALIDAZIONI

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ error: 'Bad Request', description: 'parametri invalidi', errors: errors.array() })


        const idQuest = req.body.idQuest;
        const compilazioni = req.body.arrayRisposte;
        const utilizzatore = req.body.utilizzatore;


        dao.getQuestionario(idQuest)
            .then(() => dao.getDomandeDelQuestionario(idQuest))

            .then(async (domande) => {
                let promises = [];
                for (let i = 0; i < domande.length; i++) {
                    promises.push(dao.checkValidityCompilazione(domande[i], compilazioni[i]));
                }

                return Promise.all(promises)
                    
            })
            .then(() => {
                return dao.getLastIdComp()
            })

            .then((idComp) => {
                dao.aggiungiCompilazioni(idQuest, utilizzatore, compilazioni, idComp);
            })
            .then( () => {
                return res.status(200).json(compilazioni) 
            })

            .catch((err) => res.status(500).json({ error: 'DB error', description: err }))

    });

// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
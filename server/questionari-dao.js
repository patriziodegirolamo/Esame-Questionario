'use strict';

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('questionari.db', (err) => {
    if (err) throw err;
});


// get all questionari
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM QUESTIONARI';
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const questionari = rows.map(record => ({ idQuest: record.idQuest, titolo: record.titolo, creatorId: record.creatorId, nome: record.nome }))
                resolve(questionari);
            }
        });
    });
};

exports.getAllDomande = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM DOMANDE';
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                let domande = [];
                rows.forEach(record => {
                    let domanda;
                    if (record.tipo === 0)
                        domanda = {
                            idQuest: record.idQuest, idDom: record.idDom, quesito: record.quesito,
                            tipo: record.tipo, pos: record.pos, min: record.min,
                            max: record.max, risposte: record.risposte
                        }
                    else
                        domanda = {
                            idQuest: record.idQuest, idDom: record.idDom, quesito: record.quesito,
                            tipo: record.tipo, pos: record.pos, min: record.min,
                            max: record.max, risposte: record.risposte.split("_")
                        }
                    domande.push(domanda);
                })
                resolve(domande);
            }
        });
    });
};


//get questionario by idQuest
exports.getQuestionario = (idQuest) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM QUESTIONARI WHERE idQuest=?";
        db.get(sql, [idQuest], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                reject({ error: 'Questionario non trovato.' });
            } else {
                const questionario = { idQuest: row.idQuest, titolo: row.titolo, creatorId: row.creatorId, nome: row.nome };
                resolve(questionario);
            }
        });
    });
};


//get domande by idQuest
exports.getDomandeDelQuestionario = (idQuest) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM DOMANDE WHERE idQuest=?";

        db.all(sql, [idQuest], (err, rows) => {
            if (err)
                reject(err);
            else {
                let domande = [];
                rows.forEach(record => {
                    let domanda;
                    if (record.tipo === 0)
                        domanda = {
                            idQuest: record.idQuest, idDom: record.idDom, quesito: record.quesito,
                            tipo: record.tipo, pos: record.pos, min: record.min,
                            max: record.max, risposte: record.risposte
                        }
                    else
                        domanda = {
                            idQuest: record.idQuest, idDom: record.idDom, quesito: record.quesito,
                            tipo: record.tipo, pos: record.pos, min: record.min,
                            max: record.max, risposte: record.risposte.split("_")
                        }
                    domande.push(domanda);
                })
                resolve(domande);
            }
        });
    });
};


// get all compilazioni
exports.getCompilazioni = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM RISPOSTEUSER';
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const compilazioni = rows.map(record => ({ idQuest: record.idQuest, idDom: record.idDom, risp: record.risp.split("_"), utilizzatore: record.utilizzatore, idComp: record.idComp }))
                resolve(compilazioni);
            }
        });
    });
};




// add nuovo questionario
exports.createQuestionario = (questionario) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO QUESTIONARI(idQuest, titolo, creatorId, nome) VALUES (?, ?, ?, ?)";

        db.run(sql, [questionario.idQuest, questionario.titolo, questionario.creatorId, questionario.nome], function (err) {
            if (err) {
                reject(err);
                return;
            }

            const newQuest = {
                idQuest: this.lastID, titolo: questionario.titolo,
                creatorId: questionario.creatorId, nome: questionario.nome
            }
            resolve(newQuest);
        });
    });
};


// aggiungi domande al questionario
exports.aggiungiDomande = (domande, idQuest) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO DOMANDE(idQuest, idDom, quesito, tipo, pos, min, max, risposte) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        db.serialize(() => {
            for (let i = 0; i < domande.length; i++) {
                let domanda = domande[i]


                let risposte = "";
                if (domanda.risposte != null) {
                    domanda.risposte.forEach((risp, i) => {
                        if (i === domanda.risposte.length - 1)
                            risposte = risposte + risp
                        else risposte = risposte + risp + "_"
                    })
                }
                else risposte = null;

                db.run(sql, [idQuest, i, domanda.quesito, domanda.tipo, i, domanda.min,
                    domanda.max, risposte], function (err) {
                        if (err) {
                            reject(err);
                        }

                        resolve(this.lastID);
                    });
            }
        })

    });
};

exports.checkValidityAnswer = (tipo, min, max, risposte) => {
    return new Promise((resolve, reject) => {

        let err = "";
        if (tipo === 0) {
            if (!(min == 0 || min == 1)) {
                err = "il minimo è sbagliato"
            }
            if (risposte != null) {
                err = "non deve esserci la risposta";
            }
            if (max != -1) {
                err = "non deve esserci un valore di max"
            }
        }
        else {
            if (risposte == null || risposte.length === 0) {
                err = "risposte non conformi";
            }
            if (max == -1)
                err = "il massimo deve essere positivo"

            risposte.forEach(risp => {
                if (risp === "") {
                    err = "la lunghezza non è conforme";
                }
            })
        }

        if (err != "")
            reject(err);
        else
            resolve(risposte);

    })
}


exports.checkValidityCompilazione = (domanda, compilazione) => {
    return new Promise((resolve, reject) => {

        let err = "";

        if (domanda.idDom !== compilazione.idDom)
            err = "l' id domanda non corrisponde"

        if (domanda.tipo === 0) {
            if (domanda.min === 1 && compilazione.risp === null)
                err = "non c'è la risposta ad una domanda aperta obbligatoria"

        }

        else {
            if (compilazione.risp.length > domanda.max)
                err = "nella compilazione c'è un numero di risposte maggiori del numero massimo"

            if (compilazione.risp.length < domanda.min)
                err = "nella compilazione c'è un numero di risposte maggiori del numero massimo"

            if (domanda.min !== 0)
                compilazione.risp.forEach(risp => {
                    if (!domanda.risposte.includes(risp))
                        err = "nella compilazione c'è almeno una risposta che non esiste"
                })
        }

        if (err != "")
            reject(err);
        else
            resolve(null);

    })
}

exports.getLastIdComp = () => {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT * FROM RISPOSTEUSER ORDER BY idComp DESC LIMIT 1";

        db.get(sqlGet, [], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                let lastIdComp = 0;
                if (row) {
                    lastIdComp = row.idComp + 1;
                }
                resolve(lastIdComp);

            }
        });
    });
}

exports.aggiungiCompilazioni = (idQuest, utilizzatore, compilazioni, idComp) => {
    return new Promise((resolve, reject) => {

        const sql = "INSERT INTO RISPOSTEUSER(idQuest, idDom, risp, utilizzatore, idComp) VALUES (?, ?, ?, ?, ?)";

        db.serialize(() => {

            for (let i = 0; i < compilazioni.length; i++) {
                let comp = compilazioni[i];
                let risposteInRiga;

                if (Array.isArray(comp.risp)) {
                    if (comp.risp.length === 0 && comp.risp[0] === null) {
                        risposteInRiga = null
                    }
                    else {
                        risposteInRiga = comp.risp.join("_");

                    }
                }
                else {
                    risposteInRiga = comp.risp;
                }


                db.run(sql, [idQuest, comp.idDom, risposteInRiga, utilizzatore, idComp], function (err) {

                    if (err) {
                        reject(err);
                    }
                    resolve(idComp);
                });

            }
        })


    });

};


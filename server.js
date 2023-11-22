const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const compression = require('compression');
const mysql = require('mysql2');
const sendMessage = require('./tel_send');

const pool = mysql.createPool({
});

const db = pool.promise();

// json 형태로 parsing || 중첩가능 || 압축해서 전송
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// react
app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const questions = [
    ['abstract', 'impressionist', 'pop art', 'minimalist', 'surrealist'],
    [
        ['Wassily Kandinsky', 'Piet Mondrian', 'Jackson Pollock', 'Mark Rothko'],
        ['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Vincent van Gogh'],
        ['Andy Warhol', 'Roy Lichtenstein', 'Keith Haring', 'Jasper Johns'],
        ['Agnes Martin', 'Frank Stella', 'Donald Judd', 'Dan Flavin'],
        ['Salvador Dalí', 'René Magritte', 'Max Ernst', 'Frida Kahlo']
    ],
    ['warm tones', 'cool tones', 'monochrome', 'vibrant', 'pastel'],
    ['human figures', 'animal figures', 'both human and animal figures', 'no human or animal figures'],
    ['simple (fewer elements and details)', 'moderate (balanced amount of elements and details)', 'complex (more elements and details)'],
    ['calm and relaxing', 'energetic and dynamic', 'dark and mysterious', 'whimsical and playful', 'romantic and dreamy']
]

app.post('/api/make', async (req, res) => {
    try {
        const address = req.body.address;
        const sign_value = req.body.sign_value;
        const data = req.body.data;

        await db.query(
            `INSERT INTO art_ai
                (account,sign_value,q1,q2,q3,q4,q5,q6,q7,submit_time) 
                VALUES(?,?,?,?,?,?,?,?,?,NOW())`
            , [address, sign_value, data[1], data[2], data[3], data[4], data[5], data[6], data[7]]
        )

        res.send(true)

        const [row, field] = await db.query(
            `SELECT t1.id, account, q1, q2, q3, q4, q5, q6, q7, name   FROM art_ai t1
            LEFT JOIN user t2
            ON t1.account = t2.address
            ORDER BY id DESC LIMIT 1;`
        )

        const { id, account, name, q1, q2, q3, q4, q5, q6, q7 } = row[0];

prompt: ${q1}, ${questions[0][q2]}, by ${questions[1][q2][q3]}, ${questions[2][q4]}, ${questions[3][q5]}, ${questions[4][q6]}, ${questions[5][q7]}

finder: https://www.klaytnfinder.io/tx/${sign_value}`

        await sendMessage(prompt)

    } catch (err) {
        console.error(err)
        res.send(false)
    }
})

app.listen(8000, function () {
    console.log('8000 port is listening!')
})
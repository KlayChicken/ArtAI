const mysql = require('mysql2');
const sendMessage = require('./tel_send');

const pool = mysql.createPool({
});

const db = pool.promise();

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

const make_prompts = async () => {
    const [row, field] = await db.query(
        `SELECT t1.id, account, q1, q2, q3, q4, q5, q6, q7, name FROM art_ai t1
            LEFT JOIN user t2
            ON t1.account = t2.address
            ORDER BY id;`
    )

    for (let i = 0; i < row.length; i++) {
        const { id, account, name, q1, q2, q3, q4, q5, q6, q7 } = row[i]

${q1}, ${questions[0][q2]}, by ${questions[1][q2][q3]}, ${questions[2][q4]}, ${questions[3][q5]}, ${questions[4][q6]}, ${questions[5][q7]}
`
        console.log(prompt)
        // await sendMessage(prompt)
    }
}

make_prompts();
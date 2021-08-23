const { Pool } = require("pg");
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "skatepark",
    port: "5432",
});

async function nuevoUsuario(email, nombre, password, anos_de_experiencia, especialidad, foto) {
    const client = await pool.connect()
    const result = await client.query(
        `INSERT INTO skaters (email, nombre, password, anos_de_experiencia, especialidad, foto ,estado) VALUES ('${email}','${nombre}','${password}','${anos_de_experiencia}','${especialidad}','${foto}', false) RETURNING *`
    );
    const usuario = result.rows[0];
    return usuario;
}
async function validationLogin(email, password){
    const client = await pool.connect()
    const result = await client.query({
        text: 'SELECT * FROM skaters WHERE email = $1',
        values: [email],
      }
    );
    console.log(result)
    return result.rows[0]
}

async function getskaters(){
    const client = await pool.connect()
    const result = await client.query(
    `SELECT * FROM skaters `
    );
    return result.rows
}
 async function setSkaterStatus(id, estado) {
     const result = await pool.query(
         `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
     )
     const skaters = result.rows[0];
     return skaters;
 }

 async function updateSkater(id, skaterUp) {
     console.log(skaterUp)
    const result = await pool.query(
        `UPDATE skaters SET nombre ='${skaterUp.nombre}', password = '${skaterUp.password}', anos_de_experiencia ='${skaterUp.anos_de_experiencia}', especialidad ='${skaterUp.especialidad}' WHERE id = ${id} RETURNING *`
    )
    const skaters = result.rows[0];
    return skaters;
}

async function deleteSkater(id) {
    const result = await pool.query(
        `DELETE FROM skaters WHERE id = ${id} RETURNING *`
    )
    const skaters = result.rows[0];
    return skaters;
}

module.exports = {
    nuevoUsuario,
    validationLogin,
    getskaters,
    setSkaterStatus,
    updateSkater,
    deleteSkater
}
//Mau
const express = require("express");
const morgan = require("morgan");
const database = require("./database");

//configuración inicial
const app = express();
const PORT = 4001; // Cambiar el puerto sumando 1
const IP = '192.168.56.1'; //Cambiar a tu ip usando en la consola de windows ipconfig

app.listen(PORT, IP, () => {
    console.log(`Servidor en ejecución en http://${IP}:${PORT}/alumnos`);
});

//Middlewares
app.use(morgan("dev"))
app.use(express.json());

//Rutas

//Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
    const connection = await database.getConnection();
    const [result] = await connection.query("SELECT * from alumnos");
    res.json(result)
});

//Agregar uno nuevo
app.post('/alumnos/agregar', async (req, res) => {
    const { id, nombre, edad, genero } = req.body;
    const connection = await database.getConnection();

    try {
        const [result] = await connection.query(
            'INSERT INTO alumnos (idalumnos, nombre, edad, genero) VALUES (?, ?, ?, ?)',
            [id, nombre, edad, genero]
        );

        const [result1] = await connection.query(
            'INSERT INTO calificaciones (idalumnos) VALUES (?)',
            [id]
        );

        if (result.affectedRows === 0 && result1.affectedRows === 0) {
            return res.json("Alumno no agregado");
        }

        if (result.affectedRows === 1 && result1.affectedRows === 1) {
            return res.json("Alumno agregado");
        }


        res.status(201).json({ id: result.insertId, nombre, edad, genero });
    } catch (error) {
        console.error("Error al registrar el alumno:", error);
        res.status(500).send("Error al registrar el alumno");
    }
});

//Actualizar uno que ya existe
app.put('/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, edad, genero } = req.body;
    const connection = await database.getConnection();

    try {
        const [result] = await connection.query(
            'UPDATE alumnos SET nombre = ?, edad = ?, genero = ? WHERE idalumnos = ?',
            [nombre, edad, genero, id]
        );

        if (result.affectedRows === 0) {
            return res.json("Alumno no encontrado");
        }

        if (result.affectedRows === 1) {
            return res.json("Alumno actualizado");
        }

        res.json({ id, nombre, edad, genero });
    } catch (error) {
        console.error("Error al actualizar el alumno:", error);
        res.status(500).send("Error al actualizar el alumno");
    }
});

//Cambiar edad de los alumnos
app.patch('/alumnos/:id/edad', async (req, res) => {
    const { id } = req.params;
    const { edad } = req.body;
    const connection = await database.getConnection();

    try {
        const [result] = await connection.query(
            'UPDATE alumnos SET edad = ? WHERE idalumnos = ?',
            [edad, id]
        );

        if (result.affectedRows === 1) {
            return res.json("Edad cambiada");
        }

        if (result.affectedRows === 0) {
            return res.json("Edad no cambiada");
        }

        res.json({ id, edad });
    } catch (error) {
        console.error("Error al asignar la edad al alumno:", error);
        res.status(500).send("Error al asignar el grupo al alumno");
    }
});

//Eliminar un alumno
app.delete('/alumnos/:id/borrar', async (req, res) => {
    const { id } = req.params;
    const connection = await database.getConnection();

    try {
        const [result] = await connection.query(
            'delete from alumnos where idalumnos = ?',
            [id]
        );

        const [result1] = await connection.query(
            'delete from calificaciones where idalumnos = ?',
            [id]
        );

        if (result.affectedRows === 1 && result1.affectedRows === 1) {
            return res.json("Alumno borrado");
        }
        if (result.affectedRows === 0 && result.affectedRows === 0) {
            return res.json("Alumno no encontrado");
        }
        res.status(201).json({ id: result.deleteid });
    } catch (error) {
        console.error("Error al borrar el alumno:", error);
        res.status(500).send("Error al borrar el alumno");
    }
});
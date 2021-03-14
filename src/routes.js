const express = require('express');
const DB = require('./db');

const router = express.Router();
const db = new DB();

router.get('/', async (req, res) => {
  try {
    const data = await db.query({ query: `SELECT * FROM todos` });

    if (!data) {
      throw new Error('Could not fetch');
    }

    res.status(200).send({ data });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { body } = req;
    const { insertId } = await db.query({
      query: 'INSERT INTO todos SET ?',
      data: body,
    });

    if (!insertId) {
      throw new Error('Could not insert');
    }

    res.status(201).send({ insertId });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req;

    const { affectedRows } = await db.query({
      query: `UPDATE todos SET ? WHERE id = ${db.connection.escape(id)}`,
      data: body,
    });

    if (affectedRows === 0) {
      throw new Error('could not update');
    }

    res.status(200).send({});
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { affectedRows } = await db.query({
      query: 'DELETE FROM todos WHERE id = ?',
      data: [id],
    });

    if (affectedRows === 0) {
      throw new Error('could not delete');
    }

    res.status(200).send({});
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

module.exports = router;

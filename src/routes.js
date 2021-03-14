const express = require('express');
const DB = require('./db');

const router = express.Router();
const db = new DB();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = +page === 1 ? 0 : +page * +limit - 1;

    const data = await db.query({
      query: `
        SELECT * FROM users
        LIMIT ${offset}, ${limit}
      `,
    });

    if (!data) {
      throw new Error('Could not fetch');
    }

    res.status(200).send({
      page,
      per_page: limit,
      total: data.length,
      total_pages: Math.ceil(data.length / limit),
      data,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query({
      query: `SELECT * FROM users WHERE id = ?`,
      data: [id],
    });

    if (!data) {
      throw new Error('Could not fetch');
    }

    res.status(200).send({ data });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { body } = req;
    const { insertId } = await db.query({
      query: 'INSERT INTO users SET ?',
      data: body,
    });

    if (!insertId) {
      throw new Error('Could not insert');
    }

    res.status(201).send({ data: { id: insertId, ...body } });
  } catch (err) {
    res.status(500).send({ error: err.message });
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

    res.status(200).send({ data: { body } });
  } catch (err) {
    res.status(500).send({ error: err.message });
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
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const DB = require('./db');

const router = express.Router();
const db = new DB();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const thePage = +page;
    const theLimit = +limit;
    let offset;

    if (thePage === 1) {
      offset = 0;
    } else if (thePage === 2) {
      offset = theLimit;
    } else {
      offset = thePage * theLimit - theLimit;
    }

    const [rowCount] = Object.values(
      await db.query({
        query: `SELECT COUNT(id) FROM users`,
        isArray: false,
      }),
    );

    console.log('page', thePage);
    console.log(`LIMIT ${offset}, ${limit}`);

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
      page: thePage,
      per_page: theLimit,
      total: rowCount,
      total_pages: Math.ceil(rowCount / limit),
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
      isArray: false,
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
      query: `UPDATE users SET ? WHERE id = ?`,
      data: [body, id],
    });

    if (affectedRows === 0) {
      throw new Error('could not update');
    }

    res.status(200).send({ data: body });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { affectedRows } = await db.query({
      query: 'DELETE FROM users WHERE id = ?',
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

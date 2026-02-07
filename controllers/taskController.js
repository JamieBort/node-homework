// const pool = require("../db/pg-pool");
const prisma = require("../db/prisma");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

exports.index = async (req, res) => {
	// Use global user_id (set during logon/registration)
	const tasks = await prisma.tasks.findMany({
		where: { user_id: global.user_id }, // only the tasks for this user!

		select: { id: true, title: true, is_completed: true },
	});

	if (!tasks || tasks.length === 0)
		return res.status(404).json({ message: "No tasks found for user" });

	// Use global user_id (set during logon/registration)
	// const result = await pool.query(
	// 	"SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
	// 	[global.user_id],
	// );
	// if (result.rows.length === 0) {
	// 	return res.status(404).json({ message: "No tasks found for user" });
	// }
	res.status(200).json(tasks);
	// res.status(200).json(result.rows);
};

exports.show = async (req, res) => {
	const id = parseInt(req.params?.id);
	if (!id) {
		return res.status(400).json({ message: "Invalid task id." });
	}

	// try {
	// 	const task = await prisma.tasks.findUnique({
	// 		where: {
	// 			// filter both on the id and the userId, so that there is good access control.
	// 			id_user_id: {
	// 				id,
	// 				user_id: global.user_id,
	// 			},
	// 		},
	// 	});

	// 	res.status(200).json(task);
	// } catch (err) {
	// 	if (err.code === "P2025") {
	// 		return res.status(404).json({ message: "The task was not found." });
	// 	} else {
	// 		return next(err); // pass other errors to the global error handler
	// 	}
	// }

	const task = await prisma.tasks.findUnique({
		where: {
			// filter both on the id and the userId, so that there is good access control.
			id_user_id: {
				id,
				user_id: global.user_id,
			},
		},
	});

	if (!task)
		return res.status(404).json({ message: "The task was not found." });

	res.status(200).json(task);

	// Use global user_id (set during logon/registration)
	// const result = await pool.query(
	// 	"SELECT id, title, is_completed FROM tasks WHERE id = $1 AND user_id = $2",
	// 	[id, global.user_id],
	// );
	// if (result.rows.length === 0) {
	// 	return res.status(404).json({ message: "Task not found" });
	// }
	// res.status(200).json(result.rows[0]);
};

exports.create = async (req, res) => {
	// Use global user_id (set during logon/registration)
	const { error, value } = taskSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: "Validation failed",
			details: error.details,
		});
	}

	const task = await prisma.tasks.create({
		data: {
			title: value.title,
			is_completed: value.isCompleted, // from your Joi validation
			user_id: global.user_id,
		},
	});
	res.status(201).json(task);

	// *** NOTE: use isCompleted rather than is_completed ***
	// you do your Joi validation, and you have a validated task object. Then:
	// 	const task = await pool.query(
	// 		`INSERT INTO tasks (title, is_completed, user_id)
	//   VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
	// 		[value.title, value.isCompleted, global.user_id],
	// 	);
	// You don't need a try/catch because the global error handler will handle the errors
	// res.status(201).json(task.rows[0]);
};

exports.update = async (req, res, next) => {
	const id = parseInt(req.params?.id);
	if (!id) {
		return res.status(400).json({ message: "Invalid task id." });
	}
	// Use global user_id (set during logon/registration)
	if (!req.body) {
		req.body = {};
	}
	const { error, value } = patchTaskSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: "Validation failed",
			details: error.details,
		});
	}

	try {
		const task = await prisma.tasks.update({
			data: { title: value.title, is_completed: value.isCompleted },
			where: {
				id_user_id: {
					id,
					user_id: global.user_id,
				},
			},

			select: { title: true, is_completed: true, id: true },
		});
		res.status(200).json(task);
	} catch (err) {
		if (err.code === "P2025") {
			return res.status(404).json({ message: "The task was not found." });
		} else {
			return next(err); // pass other errors to the global error handler
		}
	}

	// const { title, isCompleted } = value;
	// let result;
	// if (title !== undefined && isCompleted !== undefined) {
	// 	result = await pool.query(
	// 		"UPDATE tasks SET title = $1, is_completed = $2 WHERE id = $3 AND user_id = $4 RETURNING id, title, is_completed",
	// 		[title, isCompleted, id, global.user_id],
	// 	);
	// } else if (title !== undefined) {
	// 	result = await pool.query(
	// 		"UPDATE tasks SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title, is_completed",
	// 		[title, id, global.user_id],
	// 	);
	// } else if (isCompleted !== undefined) {
	// 	result = await pool.query(
	// 		"UPDATE tasks SET is_completed = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title, is_completed",
	// 		[isCompleted, id, global.user_id],
	// 	);
	// }
	// if (result.rows.length === 0) {
	// 	return res.status(404).json({ message: "Task not found" });
	// }
	// res.status(200).json(result.rows[0]);
};

exports.deleteTask = async (req, res, next) => {
	const id = parseInt(req.params?.id);
	if (!id) {
		return res.status(400).json({ message: "Invalid task id." });
	}

	try {
		const task = await prisma.tasks.delete({
			where: {
				id_user_id: {
					id,
					user_id: global.user_id,
				},
			},
		});

		res.status(200).json(task);
	} catch (err) {
		if (err.code === "P2025") {
			return res.status(404).json({ message: "The task was not found." });
		} else {
			return next(err); // pass other errors to the global error handler
		}
	}

	// Use global user_id (set during logon/registration)
	// const result = await pool.query(
	// 	"DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, title, is_completed",
	// 	[id, global.user_id],
	// );

	// if (result.rows.length === 0) {
	// 	return res.status(404).json({ message: "Task not found" });
	// }

	// res.status(200).json(result.rows[0]);
};

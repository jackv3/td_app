const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

const {app} = require("./../server");
const {Todo} = require("./../models/todo");

const todos = [{
  _id: new ObjectID(),
  text: "first todo text"
}, {
  _id: new ObjectID(),
  text: "second todo text",
  completed: true,
  completedAt: 123
}];
  beforeEach((done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  });

  describe("POST /todos", () => {
    it("Should add a new todo", (done) => {
      var text = "todo text";

      request(app)
      .post("/todos")
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
      ;
    });

    it("Should not create a todo with invalid body data", (done) => {

      request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
    });
  });


  describe("Get /todos", () => {
    it("Should get all todos", (done) => {
      request(app)
      .get("/todos")
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
    });
  });

  describe("GET /todos/:id", () => {
    it("should return todo doc", (done) => {
      request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
    });

    it("should return a 404 if todo is not found", (done) => {
      request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
    });

    it("should return 404 for non-object ids", (done) => {
      request(app)
      .get("/todos/123abc")
      .expect(404)
      .end(done);
    });
  });

  describe("DELETE /todos/:id", () => {

    it("should remove a todo", (done) => {
      var hexId = todos[1]._id.toHexString();

      request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).not.toBeTruthy();
          done();
        }).catch((err) => done(err));
      });
    });

    it("should return 404 if a todo is not found", (done) => {
      var hexId = new ObjectID().toHexString();

      request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
    });

    it("should return 404 if object id is invalid", (done) => {
      request(app)
      .delete(`/todos/123456`)
      .expect(404)
      .end(done);
    });
  });


  describe("PATCH /todos/:id", () => {

    it("should update a todo", (done) => {
      var text = "First todo updated from the test suite";
      request(app).
      patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({
        text: text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe("number");
      })
      .end(done);
    });


    it("should clear completed at when a todo is not completed", (done) => {
      var text = "Second todo updated from the test suite";
      request(app).
      patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({
        text: text,
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).not.toBeTruthy();
      })
      .end(done);
    });
  });

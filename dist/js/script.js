"use strict"; // const { task } = require("gulp");
//ローカルストレージに保存

var STORAGE_KEY = "task-list-vue";
var taskStorage = {
  fetch: function fetch() {
    var tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    tasks.forEach(function (task, index) {
      return task.id = index;
    });
    taskStorage.uid = tasks.length;
    return tasks;
  },
  save: function save(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};
var filters = {
  all: function all(tasks) {
    return tasks;
  },
  active: function active(tasks) {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  },
  completed: function completed(tasks) {
    return tasks.filter(function (task) {
      return task.completed;
    });
  }
};

function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, '');

  if (filters[visibility]) {
    taskApp.visibility = visibility;
  }
} // vue


var taskApp = new Vue({
  el: "#app",
  data: {
    tasks: taskStorage.fetch(),
    newTask: "",
    visibility: 'all',
    editedTask: null,
    beforeEditCache: '',
    nothingTitle: "I have nothing to do.."
  },
  computed: {
    // フィルター機能
    filterTasks: function filterTasks() {
      return filters[this.visibility](this.tasks);
    },
    // 表示件数を返す
    remaining: function remaining() {
      var tasks = filters.active(this.tasks);
      return tasks.length;
    },
    //全てのチェックボックスにチェック
    allDone: {
      get: function get() {
        return this.remaining === 0;
      },
      set: function set(value) {
        this.tasks.forEach(function (task) {
          return task.completed = value;
        });
      }
    }
  },
  methods: {
    //タスクを追加
    addTask: function addTask() {
      var value = this.newTask && this.newTask.trim();

      if (!value) {
        return;
      }

      this.tasks.push({
        id: taskStorage.uid++,
        title: value,
        completed: false
      });
      taskStorage.save(this.tasks);
      this.newTask = "";
      this.visibility = "all";
      window.location.hash = "#/all";
    },
    //タスクを削除
    removeTask: function removeTask(task) {
      console.log(task);
      this.tasks.splice(this.tasks.indexOf(task), 1);
      taskStorage.save(this.tasks);
    },
    //チェック済をまとめて削除
    removeCompleted: function removeCompleted() {
      this.tasks = filters.active(this.tasks);
    },
    //taskの再編集項目の表示
    editTask: function editTask(task) {
      this.editedTask = task;
      this.beforeEditCache = task.title;
    },
    doneEdit: function doneEdit(task) {
      if (!this.editedTask) {
        return;
      }

      this.editedTask = null;
      var title = task.title && task.title.trim();

      if (title) {
        task.title = title;
      }
    },
    canselEdit: function canselEdit(task) {
      this.editedTask = null;
      task.title = this.beforeEditCache;
    }
  },
  watch: {
    //tasksの変化を監視
    tasks: {
      handler: function handler(tasks) {
        taskStorage.save(tasks);
      },
      deep: true
    }
  },
  filters: {
    pluralize: function pluralize(n) {
      return n <= 1 ? "item" : "items";
    }
  },
  directives: {
    'todo-focus': function todoFocus(element, binding) {
      if (binding.value) {
        element.focus();
      }
    }
  }
});
window.addEventListener('hashchange', onHashChange);
onHashChange();
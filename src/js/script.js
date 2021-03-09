"use strict"

// const { task } = require("gulp");


//ローカルストレージに保存
const STORAGE_KEY = "task-list-vue";
const taskStorage = {
	fetch() {
		const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		tasks.forEach((task, index) =>
			task.id = index
		);
		taskStorage.uid = tasks.length;
		return tasks;
	},
	save(tasks) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	}
};

const filters = {
	all(tasks) {
		return tasks;
	},
	active(tasks) {
		return tasks.filter((task) =>
			!task.completed
		);
	}, 
	completed(tasks) {
		return tasks.filter((task) =>
			task.completed
		);
	}
};


function onHashChange() {
	const visibility = window.location.hash.replace(/#\/?/, '');
  

  if(filters[visibility]){
    taskApp.visibility = visibility
  }


}

// vue

const taskApp = new Vue({
  el: "#app",

  data: {
    tasks: 
      taskStorage.fetch(),
    
    newTask: "",
    visibility: 'all',
    editedTask: null,
    beforeEditCache: '',
    nothingTitle: "I have nothing to do.."
  },

  computed: {
    // フィルター機能
    filterTasks(){
      return filters[this.visibility](this.tasks);
    },

    // 表示件数を返す
    remaining(){
      const tasks = filters.active(this.tasks);

      return tasks.length;
    },

    //全てのチェックボックスにチェック
    allDone: {
      get(){
        return this.remaining === 0;
      },
      set(value){
        this.tasks.forEach((task) => 
          task.completed = value
        );
      
      }
    }

  },

  methods: {

    //タスクを追加
    addTask(){
      const value = this.newTask && this.newTask.trim();

      if(!value){
        return;
      }

      this.tasks.push({
        id: taskStorage.uid++,
        title: value,
        completed: false,
      });

      taskStorage.save(this.tasks)

      this.newTask = "" ;
      
      this.visibility = "all";
      window.location.hash = "#/all";

    },

    //タスクを削除
    removeTask(task){
      this.tasks.splice(this.tasks.indexOf(task), 1);

      taskStorage.save(this.tasks);

    },

    //チェック済をまとめて削除
    removeCompleted(){
      this.tasks = filters.active(this.tasks);
    },

    //taskの再編集項目の表示
    editTask(task){
      this.editedTask = task;
      this.beforeEditCache = task.title;
    },

    doneEdit(task){

      if(!this.editedTask){
        return;
      }

      this.editedTask = null;

      const title = task.title && task.title.trim();

      if(title) {
				task.title = title;
			} 

    },

    canselEdit(task){
      this.editedTask = null;
      task.title = this.beforeEditCache;
    },

  },

  watch: {
    //tasksの変化を監視
    tasks: {
      handler(tasks){
        taskStorage.save(tasks);
      },
      deep: true
    }
  },

  filters: {

    pluralize(n){
      return n <= 1 ? "item" : "items";
    }
  },

  directives: {
    'todo-focus'(element, binding) {
			if (binding.value) {
				element.focus();
			}
		}
  }

});


window.addEventListener('hashchange', onHashChange);
onHashChange();

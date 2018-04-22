
//Budget Controller
var budgetController = (function() {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentages = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
           sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        //-1 means doesnt exist atm
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create an ID for item
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }

            //Create new Item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //Push new item in data structure
            data.allItems[type].push(newItem);

            //Return this newItem
            return newItem;

        },
        deleteItem: function(type, ID){
            var ids, index;

            ids = data.allItems[type].map(function(current){

               return current.id;
            });

            index = ids.indexOf(ID);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(type) {
            //calculate total income and expenses
            calculateTotal(type);
            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate percentage of expenses
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(current) {
                current.calcPercentages(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPercentages;

            allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentages() ;
            });

            return allPercentages;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testData: function(){
            console.log(data);
        }
    }

})();

// UI Controller
var uiController = (function() {
    var DOMElements = {
        monthTitle: '.budget__title--month',
        typeSelect: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for ( var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return{
        getDOMElements: function(){
            return DOMElements;
        },
        addListItem: function(obj, type){
            var html, newHTMl, element;
            //Create html string with placeholder data
            if(type === 'inc'){
                element = DOMElements.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMElements.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace placeholder data with real data
            newHTMl = html.replace('%id%', obj.id);
            newHTMl = newHTMl.replace('%desc%', obj.description);
            newHTMl = newHTMl.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOm
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTMl);
        },
        deleteListItem: function(selectorID){
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearFields: function(){
            var fields, fieldsArr;

            //get list of fields
            fields = document.querySelectorAll(DOMElements.inputDescription + ',' + DOMElements.inputValue);

            //convert list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            //Clear fields
            fieldsArr.forEach(function(current){
                current.value = "";
            });
            //After clear set focus on description input
            fieldsArr[0].focus();

        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMElements.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMElements.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMElements.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMElements.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMElements.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMElements.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
            });
        },
        displayCurrMonth:  function() {
            var monthNames, today, monthLabel;

            monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            today = new Date();
            monthLabel = document.querySelector(DOMElements.monthTitle);

            monthLabel.textContent = monthNames[today.getMonth()];
        },
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMElements.typeSelect + ',' +
                DOMElements.inputDescription + ',' +
                DOMElements.inputValue
            );

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMElements.addButton).classList.toggle('red');
        },
        getInput: function () {
            return {
                type: document.querySelector(DOMElements.typeSelect).value,
                description: document.querySelector(DOMElements.inputDescription).value,
                value: parseFloat(document.querySelector(DOMElements.inputValue).value)
            }
        }

    }

})();

//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

    // Get DOM elements
    var DOM = UICtrl.getDOMElements();
    
    var setupEventListeners = function() {

        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if ( event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.typeSelect).addEventListener('change', UICtrl.changedType);
    };
    var updatePercentages = function(){
        var percentages;
        //Calculate percentages
        budgetCtrl.calculatePercentages();
        //Read percentages from budget controller
        percentages = budgetCtrl.getPercentages();
        //Update percentages in UI
        console.log(percentages);
        UICtrl.displayPercentages(percentages);

    };

    var updateBudget = function(type) {
        var budget;
        // Calculate budget
        budgetCtrl.calculateBudget(type);
        // Return budget
        budget = budgetCtrl.getBudget();
        // Display budget
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var newItem, inputData;
        // Get field input data
        inputData = UICtrl.getInput();
        if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value > 0){
            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(inputData.type, inputData.description, inputData.value);
            budgetCtrl.testData();
            // Add the new item to the UI controller
            UICtrl.addListItem(newItem, inputData.type);
            //Clear Fields after added item
            UICtrl.clearFields();
            //Calculate and Update budget
            updateBudget(inputData.type);
            //Calculate and Update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID, inputData;

        inputData = UICtrl.getInput();

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete the item from UI controller
            UICtrl.deleteListItem(itemID);

            //Update and show the new budget
            updateBudget(inputData.type);
        }
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayCurrMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, uiController);

controller.init();
// BUDGET CONTROLLER
var budgetController = (function() {
    
    //Expenses constructor function
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    //Methods for getting the correct percentage
    //'calcPercentage' calculates the percentage
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    // and 'getPercentage' returns the percentage 
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    
    //Incomes constructor function
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //Will calculate the total for the given total (income or expenses)
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    //this object reprsented by the variable 'data' is where we will store & manipulate information vital to the app functioning properly
    var data = {
        //allItems is comprised of two arrays that are filled with objects that catalog the instances created by the Expense/Income constructor functions
        allItems: {
            exp:[], //Expenses array
            inc:[]  //Incomes array 
        },
        //totals keeps track of the total for both categories 
        totals: {
            exp: 0,  //Expenses total
            inc: 0  //Incomes total 
        },
        budget: 0,
        percentage: -1 // starts at -1 to show that nothing has been done 
    };
    
    //SHARING DATA BETWEEN MODULES EXAMPLE-- (BELOW)
    //RETURN an OBJECT that is going to contain all of our PUBLIC-METHODS 
    return {
        //this function will be called in the 'controller' module 
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //Create new ID - where type is whether the object.id is an income or expense 
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            //(The segment 'data.allItems[type]' gets you access to either the 'exp' or the 'inc' array based on what the 'type' parameter is)
            }else{
                ID = 0;
            }
            
            
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //push it into our data structure 
            data.allItems[type].push(newItem);
            
            //return the new element 
            return newItem;
        },
        
        
        //Delete Item Public Method
        deleteItem: function(type, id) {
//first need to know if we are talking about an exp or an inc; secnond we will need the unique ID
            var ids, index;
            
            //Finding the correct ID: 
            //--> the solution is to create an array of all of the ID numbers that we have and then find out what the index of our input ID is -- basically the index of the element that we want to remove 
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            
            
            index = ids.indexOf(id);
            
            
            if (index !== -1) {
                //the below line will remove the specified item from the allItems arrays 
                data.allItems[type].splice(index, 1);
            }
        },
        
        
        //Calculate the budget
        calculateBudget: function() {
          
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget: income - expenses 
            data.budget = data.totals.inc - data.totals.exp;
            
            
            //Calculate the percentage of income that we spent 
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
            // Expenses = 100 and income 200, spent 50% = 100/200 = .5 * 100 
            // Expenses = 100 and income 300, spent 33.3333% = 100/300 = 0.3333 * 100 
            
            
        },
        
        
        
        calculatePercentages: function(){
            
            // calculate the percentages 
            
            data.allItems.exp.forEach(function(cur){
               cur.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentages: function(){
            
            var allPercs = data.allItems.exp.map(function(cur){
               return cur.getPercentage(); 
            });
            return allPercs;
        },
        
        
        
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        //just for testing 
        testing: function(){
            console.log(data);
        }
    };
    
    
    
})();



// UI CONTROLLER - > this is an IFFE function
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        var numSplit, int, dec, sign;
        /*Rules:
        + or - before number
        exactly 2 decimal points
        comma seperating the thousands
        */

        //Calculate the Absolute Value portion of num
        num = Math.abs(num);

        //now we want exactly 2 decimal places
        num = num.toFixed(2); //.toFixed is a method of the Number prototype
        //.toFixed returns a string 

        numSplit = num.split('.');
        //splits the num sting into an array

        int = numSplit[0];
        if(int.length > 3){
            
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
            //input 2310, output 2,310
            
        }
        
        dec = numSplit[1];
        //console.log(int, dec);
        
        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    }; 
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++){
          callback(list[i], i);
        }  
    };
    // 
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will either be inc or exp 
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            // create HTML String with Placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button></div> </div> </div>';
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
                

                
            }
            
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML text into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        //Deleting a List Item from the UI
        deleteListItem: function(selectorID){
    //The ID we are passing into this is from the ctrlDeleteItem function in the GLobal App Controller
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        //will clear the inpur fields in the UI
        clearFields: function(){
            var fields, fieldsArray;    
        
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            //this is how we clear each of the fields in fieldsArray
            // current = what 'this' is pointing to, index = current index, and array = the original array in question.  
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            //sets focus back on first element of the array (puts cursor back there)
            fieldsArray[0].focus();
        },
        
        displayBudget(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            //below data taken from the getBudget() method in the Budget Controller
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
            
        },
        
        
        displayPercentages: function(percentages){
          
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); // returns a node list stored in 'fields'
            
            //creating our own forEach function but for nodelists instead of arrays 
            
//            var nodeListForEach = function(list, callback) {
//              for(var i = 0; i < list.length; i++){
//                  callback(list[i], i);
//              }  
//            };
            
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
            
        },
        
        displayDate: function(){
            var now, year, month, months;
            now = new Date();
            //var christmas = new Date(2016, 11, 25); //month is 0 based 
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        //changing outline colors to red for expenses
        changedType: function(){
          
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
                //console.log('here');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },
        
        //We expose the DOMStrings object to the public (So other functions can access it when the UIController is called) by using the method below
        getDOMstrings: function(){
            return DOMStrings;
        }
    };
})();





//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    //sets up the event listeners we need - Lecture 8-initialization
    var setupEventListeners = function(){
        
        //inside of this DOM variable we have access to the DOMSrings object create in the UI Controller 
        var DOM = UICtrl.getDOMstrings();
        
        //the green check mark button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // the event parameter in the anon-function will get automatically get passed into the event handler by the browser 
        document.addEventListener('keypress', function(event) {
            //console.log(event); <- logs which keyboard button is pressed
            if(event.keyCode === 13 || event.which === 13){
                //console.log('ENTER was pressed.');
                ctrlAddItem();
            }
        });
        
        //adding the ctrlDeleteItem function to the Event listeners s
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        //changing the color for inc vs. exp
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    //Called each time we enter a new item into the UI
    var updateBudget = function(){
        //1. Calculate the Budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();  //now the budget is stored in that variable as an object
        
        //3. Display the budget on the UI -- using the object that is returned from the getBudget() method
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
      
        //1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    // the function that is called when the 'add item' button is pressed
    var ctrlAddItem = function() {
        var input, newItem;
        // The code below will run as soon as the button is clicked 
        //1. Get the filed input data
        input = UICtrl.getInput(); //.getInput() -- returns an object with 3 properties {type, description, value} -- to access them use 'input.propName'
        
        
        //Input sanitization for the app:
            //Description must not be an empty string && Value should not be NaN && Value should be greater than 0
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //console.log(newItem, input.type);
            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();
            
            //6. Calculate and update the percentages
            updatePercentages();
        }
        
    };
    
    
    //Delete an Income/Expense Item added to the UI 
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        //target property of the event
        itemID = event.target.parentNode.parentNode.parentElement.parentNode.id;
        
        if(itemID){
            
            //Fomat of ID is something like 'inc-1'
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            
            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            //3. Update and show the new budget in the UI
            updateBudget();
            
            //4. Calculate and update the percentages
            updatePercentages();
            
        }
    }
    
    //since we want the initialization function to be public we must return it inside of an object
    return {
        init: function(){
            console.log('The App has started!');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
}) (budgetController, UIController);


//We need to call the init function, and (as of lecture 8) this will be the only line of code on the outside
controller.init();
//^ without this line of code nothing is going to happen
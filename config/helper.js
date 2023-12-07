const moment = require('moment')
module.exports = {
  compare: function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
      throw new Error("Handlebars Helper 'compare' needs 2 parameters");
    }

    if (options && options.hash && options.hash.operator) {
      var operator = options.hash.operator;
      var operators = {
        "==": function (l, r) {
          return l == r;
        },
        "===": function (l, r) {
          return l === r;
        },
        "!=": function (l, r) {
          return l != r;
        },
        "<": function (l, r) {
          return l < r;
        },
        ">": function (l, r) {
          return l > r;
        },
        "<=": function (l, r) {
          return l <= r;
        },
        ">=": function (l, r) {
          return l >= r;
        },
        typeof: function (l, r) {
          return typeof l == r;
        },
      };

      if (!operators[operator]) {
        throw new Error(
          "Handlebars Helper 'compare' doesn't know the operator " + operator
        );
      }

      var result = operators[operator](lvalue, rvalue);

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    } else {
      throw new Error("Handlebars Helper 'compare' needs 'operator' parameter");
    }
  },
  modifyImg: function(image){
    image = image.substring(image.indexOf("\\"));
    return image
  },

  formatTime: function(time){
    time = moment(time).format("DD-MM-YYYY HH:mm")
    return time
  },
  status: function(status){
    if(status == 1){
      return "<i class='fa-sharp fa-solid fa-unlock fa-lg'></i>"
    }
    else{
      return "<i class='fa-sharp fa-solid fa-lock fa-lg'></i>"
    }
  },
};

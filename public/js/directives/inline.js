function inlineFactory(template) {

  var KEY_CODE_ENTER = 13;

  var config = {
    restrict: 'E',
    replace: true,
    scope: {
      action: '=',
      model: '=',
      type: '@',
      min: '@'
    },
    template: template,
    link: function(scope, element) {
      var children = element.children();
      var span  = angular.element(children[0]);
      var input = angular.element(children[1]);

      //puvodni obsah
      var content;
      var updated;

      function send() {
        var newContent = element.text().trim();
        if (newContent !== '') {
          scope.$apply('mode=false');
        }
        if (newContent !== content && !updated) {
          scope.action();
          updated = true;
        }
      }

      //ztrata focusu, ulozit zmenu
      input.bind('blur', function(){
        send();
      });

      //uzivatel kliknul na enter, ulozit zmenu
      input.bind('keypress', function(e){
        if (e.charCode === KEY_CODE_ENTER) send();
      });

      //po kliknuti na text zobrazit input pro editaci
      span.bind('click', function() {
        content = element.text().trim();
        scope.$apply('mode=true');
        input[0].focus();
        updated = false;
      });
    }
  }

  return function(){
    return config;
  }
}


/**
 * <inline model='page.text' action='update'/>
 */

angular.module('zdrojak.directive').directive('inline', inlineFactory(
  '<span>' +
    '<span ng-hide="mode">{{model}}</span>' +
    '<input class="input-small" type="{{type}}" min="{{min}}" ng-show="mode" ng-model="model" required>' +
    '</span>'
));
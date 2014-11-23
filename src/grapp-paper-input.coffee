Polymer 'grapp-paper-input',

  type: 'text'

  ready: ->
    inputElement = @$.decorator.querySelector('input')
    inputElement.type = @type
    inputElement.addEventListener 'keypress', ((e) ->
      if e.keyCode == 13
        @async -> @fire 'grapp-enter', @value
    ).bind @

  focus: ->
    @$.decorator.focusAction()
    @$.decorator.querySelector('input').focus()

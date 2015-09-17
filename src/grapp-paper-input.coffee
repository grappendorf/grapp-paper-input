Polymer

  is: 'grapp-paper-input'

  behaviors: [
      Polymer.IronFormElementBehavior,
      Polymer.PaperInputBehavior,
      Polymer.IronControlState
  ]

  ready: ->
    @$.input.addEventListener 'keypress', (e) =>
      if e.keyCode == 13
        @async -> @fire 'grapp-paper-input-enter', @value

  focus: ->
    @$.input.focus()

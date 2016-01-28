import expect from 'expect'
import Immutable from 'seamless-immutable'
import { INIT, SHOW, HIDE, DESTROY } from '../src/actionTypes'
import reducer from '../src/reducer'

describe('reducer', () => {
  it('return the initial state', () => {
    expect(reducer()).toEqual({})
  })

  it('handle INIT', () => {
    const action = { type: INIT, payload: { modal: 'foo' } }

    expect(reducer(undefined, action)).toEqual({
      foo: {
        show: false,
        params: {}
      }
    })
  })

  it('handle SHOW', () => {
    const action = { type: SHOW, payload: { modal: 'foo', params: { bar: 'bzz' } } }

    expect(reducer(undefined, action)).toEqual({
      foo: {
        show: true,
        params: {
          bar: 'bzz'
        }
      }
    })
  })

  it('handle HIDE', () => {
    const prevState = Immutable({
      foo: {
        show: true,
        params: {
          bar: 'bzz'
        }
      }
    })

    const action = { type: HIDE, payload: { modal: 'foo' } }

    expect(reducer(prevState, action)).toEqual({
      foo: {
        show: false,
        params: {
          bar: 'bzz'
        }
      }
    })
  })

  it('handle DESTROY', () => {
    const prevState = Immutable({
      foo: {
        show: true,
        params: {
          bar: 'bzz'
        }
      }
    })

    const action = { type: DESTROY, payload: { modal: 'foo' } }

    expect(reducer(prevState, action)).toEqual({})
  })
})

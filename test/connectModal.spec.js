import expect, { createSpy } from 'expect'
import { mount } from 'enzyme'
import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import { createStore, combineReducers } from 'redux'
import connectModal from '../src/connectModal'
import reducer from '../src/reducer'
import { show, hide, destroy } from '../src/actions'

describe('connectModal', () => {
  class ProviderMock extends Component {
    static childContextTypes = {
      store: PropTypes.object.isRequired
    };

    getChildContext() {
      return { store: this.props.store }
    }

    render() {
      return Children.only(this.props.children)
    }
  }

  class Modal extends Component {
    static propTypes = {
      show: PropTypes.bool.isRequired
    };

    render() {
      const { show } = this.props
      return (
        <div>{show}</div>
      )
    }
  }

  class MyModal extends Component {
    render() {
      const { show } = this.props

      return (
        <Modal show={show} />
      )
    }
  }

  let WrappedMyModal = connectModal({ name: 'myModal' })(MyModal)

  it('render null at first mount', () => {
    const finalReducer = () => ({ modal: { } })
    const store = createStore(finalReducer)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    expect(wrapper.html()).toEqual(null)
  })

  it('mount modal after dispatch show action', () => {
    const finalReducer = combineReducers({ modal: reducer })
    const store = createStore(finalReducer)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    expect(wrapper.html()).toEqual(null)

    store.dispatch(show('myModal'))

    expect(wrapper.find(MyModal).length).toEqual(1)
  })

  it('destroy after dispatch hide action if destroyOnHide is true', () => {
    const finalReducer = combineReducers({ modal: reducer })
    const store = createStore(finalReducer)
    WrappedMyModal = connectModal({ name: 'myModal', destroyOnHide: true })(MyModal)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    store.dispatch(show('myModal'))
    store.dispatch(hide('myModal'))

    expect(wrapper.html()).toEqual(null)
  })

  it('destroy modal state before unmount', () => {
    const mockReducer = createSpy().andReturn({})
    const finalReducer = combineReducers({ modal: mockReducer })
    const store = createStore(finalReducer)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    wrapper.unmount()

    const calls = mockReducer.calls
    expect(calls[calls.length - 1].arguments).toEqual([
      {},
      destroy('myModal')
    ])
  })

  it('pass modal state to the given component', () => {
    const finalReducer = combineReducers({
      modal: () => ({ myModal: { show: true, props: {} } })
    })

    const store = createStore(finalReducer)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    expect(wrapper.find(MyModal).props().show).toEqual(true)
  })

  it('pass handleHide to the given component', () => {
    const initialState = { myModal: { props: {}, show: true } }
    const mockReducer = createSpy().andReturn(initialState)
    const finalReducer = combineReducers({ modal: mockReducer })
    const store = createStore(finalReducer)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    wrapper.find(MyModal).props().handleHide()

    const calls = mockReducer.calls
    expect(calls[calls.length - 1].arguments).toEqual([
      initialState,
      hide('myModal')
    ])
  })

  it('resolve the promise before show', () => {
    const finalReducer = combineReducers({ modal: reducer })
    const store = createStore(finalReducer)
    const apiCall = createSpy().andReturn(new Promise(resolve => resolve()))

    WrappedMyModal = connectModal({
      name: 'myModal',
      resolve: apiCall
    })(MyModal)

    mount(
      <ProviderMock store={store}>
        <WrappedMyModal />
      </ProviderMock>
    )

    const props = { hello: 'Ava' }

    store.dispatch(show('myModal', props))

    expect(apiCall.calls[0].arguments).toEqual([ { store, props } ])
  })

  it('should pass props to wrpped modal', () => {
    const finalReducer = combineReducers({
      modal: () => ({ myModal: { show: true, props: {} } })
    })
    const store = createStore(finalReducer)

    WrappedMyModal = connectModal({ name: 'myModal' })(MyModal)

    const wrapper = mount(
      <ProviderMock store={store}>
        <WrappedMyModal hello="ava" />
      </ProviderMock>
    )

    expect(wrapper.find(MyModal).props().hello).toEqual('ava')
  })
})

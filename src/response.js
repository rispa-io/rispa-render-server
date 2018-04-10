import { Children, Component } from 'react'
import { node, number } from 'prop-types'
import withSideEffect from 'react-side-effect'

@withSideEffect(
  propsList => {
    const props = propsList[propsList.length - 1]
    if (props) {
      return props.statusCode
    }

    return undefined
  },
  () => {},
)
export default class Response extends Component {
  static propTypes = {
    children: node,
    statusCode: number,
  }

  render() {
    if (this.props.children) {
      return Children.only(this.props.children)
    }

    return null
  }
}

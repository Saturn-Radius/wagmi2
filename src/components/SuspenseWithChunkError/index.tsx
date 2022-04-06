import React, { Suspense, SuspenseProps } from 'react'

interface State {
  hasError: boolean
}

class SuspenseWithChunkError extends React.Component<SuspenseProps, State> {
  constructor(props: React.SuspenseProps | Readonly<React.SuspenseProps>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  

  render() {
    const { hasError } = this.state
    const { fallback } = this.props

    if (hasError) {
      return fallback
    }

    return <Suspense {...this.props} />
  }
}

export default SuspenseWithChunkError

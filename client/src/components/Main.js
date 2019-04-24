
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './Home'
import AssignmentAgreement from"./AssignmentAgreement"

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/agreement" component={AssignmentAgreement}/>
    </Switch>
  </main>
)

export default Main

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './Home'
import AssignmentAgreement from"./AssignmentAgreement"
import Manage from "./Manage"

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/agreement" component={AssignmentAgreement}/>
      <Route path="/manage" component={Manage}/>
    </Switch>
  </main>
)

export default Main
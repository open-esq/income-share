
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './Home'
import AssignmentAgreement from"./AssignmentAgreement"
import Manage from "./Manage"
import Student from "./Student"

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/agreement" component={AssignmentAgreement}/>
      <Route path="/manage" component={Manage}/>
      <Route path="/student" component={Student}/>
    </Switch>
  </main>
)

export default Main
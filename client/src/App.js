import React from "react";
import {Container} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import FixedMenu from "./components/FixedMenu"
import AssignmentAgreement from"./components/AssignmentAgreement"



export default class App extends React.Component {
  render() {
    return (
      <div>
        <FixedMenu/>
        <AssignmentAgreement/>
      </div>
    );
  }

};

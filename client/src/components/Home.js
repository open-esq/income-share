import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility
} from "semantic-ui-react";
import "../index.css";

/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const HomepageHeading = ({ mobile }) => (
  <Container className="overlay">
    <Header
      as="h1"
      content="ISA Assignment"
      inverted
      style={{
        fontSize: mobile ? "2em" : "4em",
        marginBottom: 0,
        paddingTop: mobile ? "1.5em" : "3em",
        textShadow: "0 0 12px rgba(0,0,0,0.5)"
      }}
    />
    <Header
      as="h2"
      content="Manage ISAs on the Ethereum Blockchain."
      inverted
      style={{
        fontSize: mobile ? "1.5em" : "1.7em",
        fontWeight: "normal",
        marginTop: mobile ? "0.5em" : "1.5em",
        textShadow: "0 0 12px rgba(0,0,0,0.5)"
      }}
    />
    <Link to="/agreement">
      <Button className="primaryBtn" size="huge">
        Make an Assignment
        <Icon name="right arrow" />
      </Button>
    </Link>
  </Container>
);

const Home = () => (
  <Responsive>
    <Visibility
      style={{
        height: "-webkit-fill-available"
      }}
    >
      <video loop autoPlay muted style={{ width: "100%"}}>
        <source
          src="https://firebasestorage.googleapis.com/v0/b/mirai-poc.appspot.com/o/Brooklyn-bridge.mp4?alt=media&token=68cff8a0-a870-44d8-bd79-05912782aac7"
          type="video/mp4"
        />
      </video>
      <HomepageHeading />
    </Visibility>
  </Responsive>
);

export default Home;

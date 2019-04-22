import React from "react";
import {
  Container,
  Menu,
  Modal,
  Button,
  Grid,
  Image,
  Header
} from "semantic-ui-react";
import metamask from "../static/metamask.png";

export const FixedMenu = ({ contract, accounts }) => (
  <Menu style={{ height: "90px" }} fixed="top" inverted>
    <Container>
      <Menu.Item as="h2" header>
        OpenLaw Income Share Assignment
      </Menu.Item>

      <Menu.Item position="right">
        {renderWelcome(contract, accounts)}
      </Menu.Item>
      <Menu.Item
        as="a"
        target="_"
        href="https://github.com/joshma91"
        position=""
      >
        <div style={{textAlign:"center"}}>
          <p style={{margin:0}}>By Josh Ma </p>
          <p style={{margin:0}}>&</p> 
          <p style={{margin:0}}>Ross Campbell</p>
      </div>
        </Menu.Item>
    </Container>
  </Menu>
);

const renderWelcome = (contract, accounts) => {
  if (contract == undefined) {
    return <MetaMaskModal />;
  } else if (accounts && accounts.length == 0) {
    return (
      <div>
        {" "}
        <strong>Please unlock your Metamask account! </strong>
        <Image style={{ display: "inline-block" }} src={metamask} />
      </div>
    );
  } else {
    return (
      <div>
        Welcome, <strong>{accounts[0]}</strong>!
      </div>
    );
  }
};

const MetaMaskModal = () => (
  <div>
    <div
      style={{ marginTop: "-10px", paddingBottom: "5px", fontWeight: "bold" }}
    >
      Running on Rinkeby Testnet
    </div>
    <Modal
      basic
      size={"tiny"}
      trigger={
        <Button className="metaBtn">
          Get Metamask{" "}
          <Image style={{ display: "inline-block" }} src={metamask} />
        </Button>
      }
    >
      <Modal.Header
        className="modalHeader"
        style={{ fontSize: "1.6em", color: "#F0F2EB" }}
      >
        Let's get you set up!{" "}
      </Modal.Header>
      <Modal.Content image style={{ paddingLeft: "60px" }}>
        <Modal.Description>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                <Header
                  as="h2"
                  content="Install and Setup MetaMask"
                  className="modalText"
                  style={{ color: "#00B6E4", marginBottom: "-20px" }}
                />
              </Grid.Column>
              <Grid.Column>
                <Image style={{ display: "inline-block" }} src={metamask} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <h3 className="modalSubText">
                  Click{" "}
                  <a className="modalLink" href="https://metamask.io/">
                    here{" "}
                  </a>
                  to install
                </h3>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                <Header
                  as="h2"
                  content="Unlock your MetaMask"
                  className="modalText"
                  style={{ color: "#00B6E4", marginBottom: "-20px" }}
                />
              </Grid.Column>
              <Grid.Column>
                <Image style={{ display: "inline-block" }} src={metamask} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                <Header
                  as="h2"
                  content="Connect to the Rinkeby Ethereum network"
                  className="modalText"
                  style={{ color: "#00B6E4" }}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Description>
      </Modal.Content>
      <div />
    </Modal>
  </div>
);

export default FixedMenu;

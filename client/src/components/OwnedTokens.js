import React from "react";
import { Grid, Table, Segment, Header, Form, Button } from "semantic-ui-react";

class OwnedTokens extends React.Component {
  state={
    tokenIndex: 1
  }

  render() {
    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
            <Header as="h3">Your Owned Tokens</Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={5}>
                    Token Contract Address
                  </Table.HeaderCell>
                  <Table.HeaderCell width={3}>
                    Number of Tokens
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                  <a onClick={()=>this.setState({tokenIndex:1})}>0xf290f3d843826d00f8176182fd76550535f6dbb4</a> 
                    
                  </Table.Cell>
                  <Table.Cell>52</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                  <a style={{fontWeight:"bold"}} onClick={()=>this.setState({tokenIndex:2})}>0x04Bb2058E3cfC31721d50DceF96C576C761b38c0</a> 
                    
                  </Table.Cell>
                  <Table.Cell>11</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Grid.Column>
          <Grid.Column width={6}>
            <Header as="h3">Token Details</Header>
            <Segment>
              <Form size="large">
                <span style={{display:"block", paddingBottom:"5px", fontSize:"13px", fontWeight:"bold"}}>0x04Bb2058E3cfC31721d50DceF96C576C761b38c0</span>
                <Form.Field name="companyName" width={16}>
                  <label>Company Name</label>
                  <input disabled value="Lambda Inc." />
                </Form.Field>

                <Form.Field name="studentName" width={16}>
                  <label>Student Name</label>
                  <input disabled value="Josh Ma" />
                </Form.Field>
                <Form.Field name="ethPaid" width={16}>
                  <label>ETH Paid to You</label>
                  <input disabled value="4.4" />
                </Form.Field>
                <Button>Manage Pending Assignment</Button>
              </Form>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default OwnedTokens;

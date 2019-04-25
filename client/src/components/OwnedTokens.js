import React from "react";
import {
  Grid,
  Table,
  Segment,
  Header,
  Form,
  Button,
} from "semantic-ui-react";


const RANKS = [
  {value: "Private", text : "Private"},
  {value: "Corporal", text : "Corporal"},
  {value: "Sergeant", text : "Sergeant"},
  {value: "Lieutenant", text : "Lieutenant"},
  {value: "Captain", text : "Captain"},
  {value: "Major", text : "Major"},
  {value: "Colonel", text : "Colonel"},
];

const MECHS = [
  {value : "WHM-6R", text : "Warhammer WHM-6R"}
];

const OwnedTokens = () => {

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
                              0xf290f3d843826d00f8176182fd76550535f6dbb4
                              </Table.Cell>
                              <Table.Cell>
                                  52
                              </Table.Cell>
                 
                          </Table.Row>
                      </Table.Body>

                   </Table>
              </Grid.Column>
              <Grid.Column width={6}>
                  <Header as="h3">Token Details</Header>
                  <Segment >
                      <Form size="large">
                          <Form.Field name="companyName" width={16} >
                              <label>Company Name</label>
                              <input
                                  disabled
                                  value="Lambda Inc."
                              />
                          </Form.Field>

                          <Form.Field name="studentName" width={16} >
                              <label>Student Name</label>
                              <input
                                  disabled
                                  value="Josh Ma"
                              />
                          </Form.Field>
                          <Form.Field name="ethPaid" width={16} >
                              <label>ETH Paid to You</label>
                              <input
                                  disabled
                                  value="4.4"
                              />
                          </Form.Field>
                          <Button>Manage Pending Assignment</Button>
                      </Form>
                  </Segment>
              </Grid.Column>
          </Grid>
      </div>
  )
}

export default OwnedTokens
pragma solidity ^0.5.0;

contract IncomeAssignment {

  // @notice Assignment defines details of an assignment
  struct Assignment {
    address assignor;
    address assignee;
    uint priceInEth;
    uint numTransferred;
    bool confirmed;
  }

  address owner;

  // @notice ERC20 address -> Assignment number -> Assignment
  mapping (address => mapping(uint => Assignment)) public assignmentHistory;

  // @notice ERC20 address -> Assignment index (defaults to 0)
  mapping (address => uint) public currAssignment; 

  constructor() public {
    owner = msg.sender;
  }
  
  modifier onlyOwner(address _owner) {
    require (msg.sender == _owner);
    _;
  }

  function recordAssignment(address _contract, address _assignor, address _assignee, uint _priceInEth, uint _numTransferred) public onlyOwner (msg.sender) {
    Assignment memory _assignment = Assignment({
      assignor: _assignor,
      assignee: _assignee,
      priceInEth: _priceInEth,
      numTransferred: _numTransferred,
      confirmed: false
    });
    
    assignmentHistory[_contract][currAssignment[_contract]++] = _assignment;
  }

  function () external payable { }

  function executeAssignment(address _contract, uint _assignmentNum) public {

    // Need to import ProofClaim for this to work
    ProofClaim PCToken = ProofClaim(_contract);
    uint assignorTokens = PCToken.balanceOf(msg.sender);
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];
    require (msg.sender == _assignment.assignor);
    require (assignorTokens >= _assignment.numTransferred);
    assignorTokens = PCToken.transfer(_assignment.assignee, _assignment.numTransferred);
    _assignment.confirmed = true;   
    
    assignmentHistory[_contract][_assignmentNum] = _assignment; 
  }
}

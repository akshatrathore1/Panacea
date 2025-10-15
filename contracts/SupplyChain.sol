// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChain
 * @dev Smart contract for KrashiAalok agricultural supply chain transparency
 * @author KrashiAalok Team
 */
contract SupplyChain {
    
    // Enums
    enum UserRole { Producer, Intermediary, Retailer, Consumer }
    enum QualityGrade { A, B, C, Organic, Premium }
    
    // Structs
    struct User {
        address wallet;
        UserRole role;
        string name;
        string phone;
        string location;
        bool verified;
        uint256 registrationTime;
    }
    
    struct Batch {
        uint256 batchId;
        address creator;
        string cropType;
        string variety;
        string farmLocation;
        uint256 weight; // in kg
        QualityGrade qualityGrade;
        uint256 pricePerKg; // in wei
        string additionalData; // JSON string for extra metadata
        address currentOwner;
        uint256 createdAt;
        bool forSale;
        bool exists;
    }
    
    struct Transaction {
        uint256 transactionId;
        uint256 batchId;
        address from;
        address to;
        uint256 amount; // Total amount in wei
        uint256 pricePerKg;
        string transactionType; // "cash", "upi", "online"
        uint256 timestamp;
        string notes;
    }
    
    struct QualityReport {
        uint256 batchId;
        address inspector;
        QualityGrade grade;
        string reportData; // JSON string with quality parameters
        uint256 timestamp;
        bool isIoTVerified;
    }
    
    // State variables
    address public owner;
    uint256 public batchCounter;
    uint256 public transactionCounter;
    
    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Transaction[]) public batchTransactions;
    mapping(uint256 => address[]) public batchOwnershipHistory;
    mapping(address => uint256[]) public userBatches;
    mapping(uint256 => QualityReport[]) public batchQualityReports;
    
    // Events
    event UserRegistered(address indexed user, UserRole role, string name);
    event BatchCreated(
        uint256 indexed batchId, 
        address indexed creator, 
        string cropType, 
        uint256 weight
    );
    event BatchTransferred(
        uint256 indexed batchId, 
        address indexed from, 
        address indexed to,
        uint256 amount
    );
    event QualityUpdated(
        uint256 indexed batchId, 
        address indexed inspector, 
        QualityGrade grade
    );
    event BatchListedForSale(uint256 indexed batchId, uint256 pricePerKg);
    event BatchSold(
        uint256 indexed batchId, 
        address indexed seller, 
        address indexed buyer,
        uint256 totalAmount
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].wallet != address(0), "User not registered");
        _;
    }
    
    modifier batchExists(uint256 _batchId) {
        require(batches[_batchId].exists, "Batch does not exist");
        _;
    }
    
    modifier onlyBatchOwner(uint256 _batchId) {
        require(batches[_batchId].currentOwner == msg.sender, "Not the owner of this batch");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        batchCounter = 0;
        transactionCounter = 0;
    }
    
    // User Management Functions
    function registerUser(
        UserRole _role,
        string memory _name,
        string memory _phone,
        string memory _location
    ) external {
        require(users[msg.sender].wallet == address(0), "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_phone).length > 0, "Phone cannot be empty");
        
        users[msg.sender] = User({
            wallet: msg.sender,
            role: _role,
            name: _name,
            phone: _phone,
            location: _location,
            verified: false,
            registrationTime: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _role, _name);
    }
    
    function verifyUser(address _user) external onlyOwner {
        require(users[_user].wallet != address(0), "User not registered");
        users[_user].verified = true;
    }
    
    // Batch Management Functions
    function createBatch(
        string memory _cropType,
        string memory _variety,
        string memory _farmLocation,
        uint256 _weight,
        QualityGrade _qualityGrade,
        uint256 _pricePerKg,
        string memory _additionalData
    ) external onlyRegistered returns (uint256) {
        require(_weight > 0, "Weight must be greater than 0");
        require(bytes(_cropType).length > 0, "Crop type cannot be empty");
        
        batchCounter++;
        uint256 newBatchId = batchCounter;
        
        batches[newBatchId] = Batch({
            batchId: newBatchId,
            creator: msg.sender,
            cropType: _cropType,
            variety: _variety,
            farmLocation: _farmLocation,
            weight: _weight,
            qualityGrade: _qualityGrade,
            pricePerKg: _pricePerKg,
            additionalData: _additionalData,
            currentOwner: msg.sender,
            createdAt: block.timestamp,
            forSale: false,
            exists: true
        });
        
        // Initialize ownership history
        batchOwnershipHistory[newBatchId].push(msg.sender);
        userBatches[msg.sender].push(newBatchId);
        
        emit BatchCreated(newBatchId, msg.sender, _cropType, _weight);
        return newBatchId;
    }
    
    function transferBatch(
        uint256 _batchId, 
        address _to, 
        uint256 _amount,
        string memory _transactionType,
        string memory _notes
    ) external batchExists(_batchId) onlyBatchOwner(_batchId) {
        require(_to != address(0), "Invalid recipient address");
        require(users[_to].wallet != address(0), "Recipient not registered");
        require(_to != msg.sender, "Cannot transfer to yourself");
        
        Batch storage batch = batches[_batchId];
        address previousOwner = batch.currentOwner;
        
        // Update batch ownership
        batch.currentOwner = _to;
        batch.forSale = false;
        
        // Update ownership history
        batchOwnershipHistory[_batchId].push(_to);
        userBatches[_to].push(_batchId);
        
        // Record transaction
        transactionCounter++;
        batchTransactions[_batchId].push(Transaction({
            transactionId: transactionCounter,
            batchId: _batchId,
            from: previousOwner,
            to: _to,
            amount: _amount,
            pricePerKg: batch.pricePerKg,
            transactionType: _transactionType,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit BatchTransferred(_batchId, previousOwner, _to, _amount);
        
        if (_amount > 0) {
            emit BatchSold(_batchId, previousOwner, _to, _amount);
        }
    }
    
    function listBatchForSale(uint256 _batchId, uint256 _pricePerKg) 
        external 
        batchExists(_batchId) 
        onlyBatchOwner(_batchId) 
    {
        require(_pricePerKg > 0, "Price must be greater than 0");
        
        Batch storage batch = batches[_batchId];
        batch.forSale = true;
        batch.pricePerKg = _pricePerKg;
        
        emit BatchListedForSale(_batchId, _pricePerKg);
    }
    
    function updateQuality(
        uint256 _batchId,
        QualityGrade _grade,
        string memory _reportData,
        bool _isIoTVerified
    ) external batchExists(_batchId) onlyRegistered {
        Batch storage batch = batches[_batchId];
        batch.qualityGrade = _grade;
        
        batchQualityReports[_batchId].push(QualityReport({
            batchId: _batchId,
            inspector: msg.sender,
            grade: _grade,
            reportData: _reportData,
            timestamp: block.timestamp,
            isIoTVerified: _isIoTVerified
        }));
        
        emit QualityUpdated(_batchId, msg.sender, _grade);
    }
    
    // View Functions
    function getBatch(uint256 _batchId) 
        external 
        view 
        batchExists(_batchId) 
        returns (Batch memory) 
    {
        return batches[_batchId];
    }
    
    function getBatchHistory(uint256 _batchId) 
        external 
        view 
        batchExists(_batchId) 
        returns (address[] memory) 
    {
        return batchOwnershipHistory[_batchId];
    }
    
    function getBatchTransactions(uint256 _batchId) 
        external 
        view 
        batchExists(_batchId) 
        returns (Transaction[] memory) 
    {
        return batchTransactions[_batchId];
    }
    
    function getUserBatches(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userBatches[_user];
    }
    
    function getBatchQualityReports(uint256 _batchId) 
        external 
        view 
        batchExists(_batchId) 
        returns (QualityReport[] memory) 
    {
        return batchQualityReports[_batchId];
    }
    
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
    
    function getAllBatchesForSale() external view returns (uint256[] memory) {
        uint256[] memory forSaleBatches = new uint256[](batchCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= batchCounter; i++) {
            if (batches[i].forSale && batches[i].exists) {
                forSaleBatches[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = forSaleBatches[j];
        }
        
        return result;
    }
    
    function getTotalStats() external view returns (
        uint256 totalBatches,
        uint256 totalTransactions,
        uint256 totalUsers
    ) {
        // Note: totalUsers would need a separate counter in a real implementation
        return (batchCounter, transactionCounter, 0);
    }
    
    // Utility Functions
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
    
    // Emergency Functions
    function pause() external onlyOwner {
        // Implementation for emergency pause
    }
    
    function unpause() external onlyOwner {
        // Implementation for emergency unpause
    }
}
## Packet Types

### A. Single Full MIDI Message
```
[Header, Timestamp, Status, Data1, Data2]
```

### B. Multiple Full MIDI Messages  
```
[Header, Timestamp1, Status1, Data1, Data2, Timestamp2, Status2, Data1, Data2]
```

### C. Multiple Running Status MIDI Messages 
```
[Header, Timestamp, Status, Data1, Data2, Data1, Data2]
```  

### D. Full MIDI Message with Running Status  
```
[Header, Timestamp, Status1, Data1, Data2, Data1, Data2]
```

### E. Full MIDI Message with Running Status and Timestamp  
```
[Header, Timestamp1, Status1, Data1, Data2, Timestamp2, Data1, Data2]
```

### F. System Exclusive (SysEx) Start to End in One Packet  
```
[Header, Timestamp, 0xF0, Data1, ..., Timestamp, 0xF7]
```

### G. System Exclusive (SysEx) Start to End in One Packet Real-Time message Interleaving    
```
[Header, Timestamp, 0xF0, Data1, ..., Timestamp, Real-Time Status, Timestamp, 0xF7]
```

### H. SysEx Start with Continuation  
```
[Header, Timestamp, 0xF0, Data1, ...]
```

### H. SysEx Start with Real-Time Message Interleaving  
```
[Header, Timestamp, 0xF0, Data1, ..., Timestamp, Real-Time Status, ...]
```

### I. SysEx Continuation Packet
```
[Header, Data1, Data2, ...]
```

### J. SysEx Continuation Packet with Real-Time Message Interleaving
```
[Header, Data1, Data2, ..., Timestamp, Real-Time Status, ...]
```
  
### K. SysEx Termination Packet
```
[Header, Data1, Data2, ..., Timestamp, 0xF7]
```  

### L. SysEx Termination Packet with Real-Time Message Interleaving
```
[Header, Data1, Data2, ..., Timestamp, Real-Time Status, ..., Timestamp, 0xF7]
```

### M. Mixed MIDI and SysEx Messages in One Packet
```
[Header, Timestamp, Status, Data1, Data2, Timestamp, 0xF0, Data1, ..., Timestamp, 0xF7]
```

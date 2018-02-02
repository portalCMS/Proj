/**
 * Created by Administrator on 2017/7/11 0011.
 */
export class SearchModel{
  public startTime:Date;
  public endTime:Date;
  public agentName:string;
  public statisType:number;
  public roomNumber:string;
  public roomAgent:string;

  public static create(model:SearchModel){
    let temp = new SearchModel();
    temp.startTime = new Date(model.startTime);
    temp.endTime = new Date(model.endTime);
    temp.agentName = model.agentName;
    temp.roomAgent = model.roomAgent;
    temp.roomNumber = model.roomNumber;
    temp.statisType = model.statisType;
    return temp;
  }
}

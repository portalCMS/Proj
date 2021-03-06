/**
 * Created by Administrator on 2017/7/11 0011.
 */
export class SearchModel{
  public currentPage:number = 1;
  public pageSize:number = 50;
  public startTime:Date;
  public endTime:Date;
  public loginName:string;

  public static create(model:SearchModel){
    let temp = new SearchModel();
    temp.currentPage = model.currentPage;
    temp.pageSize = model.pageSize;
    temp.startTime = new Date(model.startTime);
    temp.endTime = new Date(model.endTime);
    temp.loginName = model.loginName;
    return temp;
  }
}

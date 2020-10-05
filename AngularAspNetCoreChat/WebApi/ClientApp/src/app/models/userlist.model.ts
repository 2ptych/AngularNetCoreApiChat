export class UserListModel {
  name: string;
  familyName: string;
  userId: string;
  userPhoto: string;

  constructor(_userName: string, _familyName: string, _userId: string, _userPhoto: string) {
    this.name = _userName;
    this.familyName = _familyName;
    this.userId = _userId;
    this.userPhoto = _userPhoto;
  }
}

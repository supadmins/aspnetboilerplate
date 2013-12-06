﻿define(["jquery", "knockout", 'plugins/dialog', 'service!dto', 'service!taskever/task', 'service!taskever/friendship', 'session'],
    function ($, ko, dialogs, dtos, taskService, friendshipService, session) {
        return function () {
            var that = this;

            // Private fields /////////////////////////////////////////////////////

            var _$form;

            var _currentUser = session.getCurrentUser();

            // Public fields //////////////////////////////////////////////////////

            that.task = {
                title: ko.observable(),
                description: ko.observable(),
                assignedUserId: ko.observable(_currentUser.id()),
                priority: ko.observable(taskever.taskPriority.Normal),
                privacy: ko.observable(taskever.taskPrivacy.Protected),
                privacyEditable: ko.observable(true)
            };

            that.task.assignedUserId.subscribe(function (newValue) {
                if (newValue == _currentUser.id()) {
                    that.task.privacyEditable(true);
                } else {
                    that.task.privacyEditable(false);
                    that.task.privacy(taskever.taskPrivacy.Protected);
                }
            });

            that.users = ko.mapping.fromJS([]);

            // Public methods /////////////////////////////////////////////////////

            that.canActivate = function () {
                return friendshipService.getFriendships({
                    userId: _currentUser.id(),
                    status: taskever.friendshipStatus.Accepted,
                    canAssignTask: true
                }).done(function (result) {
                    var users = $.map(result.friendships, function (friendship) { return friendship.friend; });
                    ko.mapping.fromJS(users, that.users);
                    that.users.unshift(_currentUser);
                });
            };

            that.attached = function (view, parent) {
                _$form = $(view).find('form');
                _$form.validate();
            };

            that.saveNewTask = function () {
                if (!_$form.valid()) {
                    return;
                }

                taskService.createTask({
                    task: ko.mapping.toJS(that.task)
                }).done(function (result) {
                    dialogs.close(that, ko.mapping.fromJS(result.task));
                });
            };

            that.cancel = function () {
                dialogs.close(that);
            };
        };
    });
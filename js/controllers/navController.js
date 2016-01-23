var myClinic = angular.module("myClinic");

myClinic.controller("NavController", function($scope, $location, $q, $timeout, Pagination) {

    $scope.getAccessToDb = function(password) {
        fs.readFile('storage/tech.txt', function(err, data) {
            if (SHA3(password).toString() === data.toString().substr(0, 128)) {
                encryptor.decryptFile('storage/encrypted.dat', 'storage/clients.json', password, options, function(err) {
                    if (err) {
                        throw err;
                    } else {
                        $scope.key = password;
                        $timeout(function() {
                            $scope.message = 'Спасибі) Гарного дня!';
                        }, 0);
                        db = db.connect('storage', ['clients']);
                        $timeout(function() {
                            $scope.go('main', false)
                        }, 3000);
                    }
                });
            } else {
                $timeout(function() {
                            $scope.message = 'Спробуйте ввести пароль ще раз';
                        }, 0);
                $timeout(function() {
                    $scope.message = null;
                    $scope.owner.password = '';
                    $scope.go('home', false)
                }, 2000);
            }
        })
    };

    $scope.go = function(path, clear) {
        $location.path(path);
        console.log(path);
        if (clear) {
            $scope.clearTemp();
        }
    };

    $scope.triggerWorkForm = function() {
        $scope.workForm = !$scope.workForm;
    };

    $scope.winClose = function() {
        if ($location.path() === '/home'){
            win.close();
        }
        else
        {
            $scope.hideClients()
        }
    };

    $scope.hideClients = function(){
        encryptor.encryptFile('storage/clients.json', 'storage/encrypted.dat', $scope.key, options, function(err) {
                if (!err) {
                    fs.unlink('storage/clients.json', function(err) {
                        if (err) throw err;
                        console.log('successfully deleted /tmp/hello');
                    });
                    win.close();
                }
            });
    }

    $scope.ifHome = function(){
        return ($location.path() === '/home') ? true : false;
    };

    $scope.winMaximize = function() {
        if (win.isMaximized)
            win.unmaximize();
        else
            win.maximize();
    }

    $scope.winUnmaximize = function() {
        win.minimize();
    }

    $scope.selectedTooth;
    $scope.selectedChar;
    $scope.selectedPatient;
    $scope.selectedAppointment;
    $scope.patientToUpdate;
    $scope.dataAtr;
    $scope.workForm = false;
    $scope.toothInfo = true;
    $scope.pagination = Pagination.getNew(6);


    $scope.addWork = function(work) {
        var index = $scope.selectedPatient.appointments.indexOf($scope.selectedAppointment);
        $scope.selectedAppointment.worksDone.push(work);
        $scope.selectedPatient.appointments.splice(index, 1, $scope.selectedAppointment);
        $scope.updateAppoint($scope.selectedPatient);
        $scope.triggerWorkForm();
    }

    $scope.updateAppoint = function(patient) {
        var query = {
            _id: patient._id
        }
        var options = {
            multi: false,
            upsert: false
        };

        db.clients.update(query, patient, options);
    };

    $scope.goHomeAndSelect = function(client, refresh) {
        $scope.go('/main');
        if (refresh) {
            $scope.refreshAppointList(client);
        }
    }

    $scope.isEmpty = function() {
        if ($scope.clients.length === 0) {
            return true;
        }
        return false;
    };

    $scope.isSelected = function(char) {
        if ($scope.selectedChar) {
            return $scope.selectedChar === char;
        }
    };

    $scope.isSelectedTooth = function(num) {
        if ($scope.selectedTooth) {
            return $scope.selectedTooth === num;
        }
    };

    $scope.isSelectedPatient = function(client) {
        if ($scope.selectedPatient) {
            return $scope.selectedPatient === client;
        }
    };

    $scope.defer = function(char) {
        var q = $q.defer();

        q.resolve(db.clients.find({
            firstChar: char
        }));
        return q.promise
    };

    $scope.clearTemp = function() {
        $scope.newClient = null;
        $scope.patientToUpdate = null;
        $scope.query = null;
    };

    $scope.selectAppointment = function(appoint) {
        $scope.worksDone = null;
        $scope.toothInfo = true;
        $scope.selectedTooth = null;
        $scope.selectedAppointment = appoint;
        $scope.worksDone = appoint.worksDone;
        $scope.findHealedTeeth(appoint.worksDone);
    };

    $scope.findAllHealedTeeth = function(arr) {
        var result = result || [];
        angular.forEach(arr, function(elm) {
            $scope.iterateOverArray(elm.worksDone, result);
        })
        $timeout(function() {
            $scope.healedTeeth = result;
        }, 0, true);
    }

    $scope.isBeenHealed = function(elm) {
        if (elm && $scope.healedTeeth) {
            return ($scope.healedTeeth.indexOf(elm.toString()) == -1) ? false : true;
        }
    };

    $scope.findWorkOnTooth = function(num) {
        var result = [];
        angular.forEach($scope.selectedPatient.appointments, function(outh_elm) {
            angular.forEach(outh_elm.worksDone, function(inner_elm) {
                if (inner_elm.teeth_nums.length > 0) {
                    if (inner_elm.teeth_nums.indexOf(num.toString()) == -1) {

                    } else {
                        result.unshift(inner_elm.workType + ": " + inner_elm.exactWork);
                    }
                }
            })
        })
        $scope.toothInfo = false;
        $scope.selectedTooth = num;
        $scope.toothInfoList = result;
    }

    $scope.iterateOverArray = function(arr, result) {
        angular.forEach(arr, function(elm) {
            var arr_len = elm.teeth_nums.length,
                i = 0;
            if (arr_len > 1) {
                for (i; i < arr_len; i++) {
                    result.push(elm.teeth_nums[i]);
                }
            } else {
                result.push(elm.teeth_nums[0]);
            }
        })
        return result;
    }

    $scope.findHealedTeeth = function(arr) {
        var result = result || [];
        $scope.iterateOverArray(arr, result);
        $timeout(function() {
            $scope.healedTeeth = result;
        }, 0, true);
    };

    $scope.paginationManage = function() {
        $scope.pagination.numPages = Math.ceil($scope.appointments.length / $scope.pagination.perPage);
    };

    $scope.selectPatient = function(client) {
        $scope.selectedTooth = null;
        $scope.selectedAppointment = null;
        $scope.healedTeeth = [];
        $scope.toothInfo = true;
        $scope.selectedPatient = client;
        $scope.appointments = client.appointments;
        $scope.paginationManage();
        $scope.findAllHealedTeeth(client.appointments);
    };

    $scope.initUpdate = function(patient) {
        $scope.go('/createForm')
        $scope.patientToUpdate = true;
        $scope.newClient = patient;
        $scope.query = {
            _id: patient._id
        };
    };

    $scope.updateForm = function(patient) {
        var options = {
            multi: false,
            upsert: false
        };
        db.clients.update($scope.query, patient, options);

        $scope.goHomeAndSelect(patient);
    };

    $scope.deleteAppoint = function(appoint, client) {
        if (confirm("Ви впевнені, що хочете видалити цей прийом?")) {
            var index = $scope.selectedPatient.appointments.indexOf(appoint);
            $scope.selectedPatient.appointments.splice(index, 1);
            $scope.updateAppoint($scope.selectedPatient);
            $scope.selectedAppointment = null;
            $scope.paginationManage();
        }
    };

    $scope.deleteWork = function(work) {
        if (confirm("Ви впевнені, що хочете видалити запис про виконану роботу?")) {
            var index = $scope.selectedPatient.appointments.indexOf($scope.selectedAppointment);
            var index_work = $scope.selectedAppointment.worksDone.indexOf(work);
            $scope.selectedAppointment.worksDone.splice(index_work, 1);
            $scope.selectedPatient.appointments.splice(index, 1, $scope.selectedAppointment);
            $scope.updateAppoint($scope.selectedPatient);
        }
    };

    $scope.createAppointment = function(client) {
        var date = new Date(),
            strDate = date.toString(),
            creationdDate = strDate.substring(11, 15) + ' ' + $scope.localize[strDate.substring(4, 7)] + strDate.substring(7, 10),
            appointment = {
                creationTime: creationdDate,
                worksDone: []
            }
        $scope.selectedPatient.appointments.push(appointment);

        $scope.updateAppoint(client);
        debugger;
        $timeout(function() {
            $scope.selectAppointment(appointment);
            $scope.paginationManage();
        }, 0, true)
    };

    $scope.refreshAppointList = function(client) {
        $timeout(function() {
            $scope.findInDatabase(client.firstChar, false);
            $scope.selectPatient(client);
        }, 0, true);
    };

    $scope.findInDatabase = function(char, refresh) {
        $scope.defer(char).then(function(data) {
            $scope.clients = data;
            $scope.selectedChar = char;
            if (refresh) {
                $scope.selectedPatient = null;
            }
        }, function(err) {
            console.log(err);
        });
    };

    $scope.localize = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12'
    }

    $scope.localize_month = {
        '01': 'Січня' ,
        '02': 'Лютого',
        '03': 'Березня',
        '04': 'Квітня',
        '05': 'Травня',
        '06': 'Червня',
        '07': 'Липня',
        '08': 'Серпня',
        '09': 'Вересня',
        '10': 'Жовтня',
        '11': 'Листопада',
        '12': 'Грудня'
    }

    $scope.up_teeth_num = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];

    $scope.bottom_teeth_num = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

    $scope.up_milk_num = [55,54,53,52,51,61,62,63,64,65];

    $scope.bottom_milk_num = [85,84,83,82,81,71,72,73,74,75];

});
package com.example.tasktracker.repository;

import com.example.tasktracker.entity.TaskActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {

    List<TaskActivity> findByTaskId(Long taskId);

    // Delete all activity records for a task before deleting the task itself
    @Modifying
    @Transactional
    @Query("DELETE FROM TaskActivity a WHERE a.task.id = :taskId")
    void deleteByTaskId(Long taskId);
}